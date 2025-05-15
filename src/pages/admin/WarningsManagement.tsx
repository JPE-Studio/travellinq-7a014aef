
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Search, 
  CalendarIcon,
  FileWarning 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import AdminDashboardLayout from "@/components/admin/DashboardLayout";
import { getAllActiveWarnings, removeWarning } from "@/services/moderationService";
import { UserWarning } from "@/types/roles";

const WarningsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();
  
  const { 
    data: warnings = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['warnings'],
    queryFn: getAllActiveWarnings
  });
  
  const handleRemoveWarning = async (warningId: string) => {
    try {
      const success = await removeWarning(warningId);
      if (success) {
        toast({
          title: "Warning removed",
          description: "The warning has been successfully removed.",
        });
        refetch();
      } else {
        toast({
          title: "Action failed",
          description: "Failed to remove the warning.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing warning:", error);
      toast({
        title: "Action failed",
        description: "Failed to remove the warning.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewPost = (postId?: string) => {
    if (postId) {
      navigate(`/post/${postId}`);
    }
  };
  
  const handleViewUser = (userId: string) => {
    navigate(`/user/${userId}`);
  };
  
  // Filter warnings
  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = 
      warning.user?.pseudonym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warning.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = 
      filterSeverity === 'all' || warning.severity === filterSeverity;
    
    const matchesDate = 
      !date || new Date(warning.created_at).toDateString() === date.toDateString();
    
    return matchesSearch && matchesSeverity && matchesDate;
  });
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'minor':
        return <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">Minor</span>;
      case 'moderate':
        return <span className="bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs">Moderate</span>;
      case 'severe':
        return <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs">Severe</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs">{severity}</span>;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Warnings</h2>
            <p className="text-muted-foreground">
              Manage warnings issued to users for content violations.
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warnings..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={filterSeverity}
            onValueChange={setFilterSeverity}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                }}
                initialFocus
              />
              {date && (
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setDate(undefined)}
                  >
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error Loading Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Could not load user warnings. Please try again later.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardFooter>
          </Card>
        ) : filteredWarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Warnings Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterSeverity !== 'all' || date 
                ? "No warnings match your filters. Try adjusting your search criteria."
                : "There are no active warnings in the system."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWarnings.map((warning) => (
              <Card key={warning.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle 
                          className="text-lg hover:underline cursor-pointer"
                          onClick={() => handleViewUser(warning.user_id)}
                        >
                          {warning.user?.pseudonym || "Unknown User"}
                        </CardTitle>
                        {getSeverityBadge(warning.severity)}
                      </div>
                      <CardDescription>
                        Warned on {new Date(warning.created_at).toLocaleDateString()} by {warning.moderator?.pseudonym || "Unknown Moderator"}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Actions</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRemoveWarning(warning.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Remove warning
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewUser(warning.user_id)}>
                          View user profile
                        </DropdownMenuItem>
                        {warning.related_post_id && (
                          <DropdownMenuItem onClick={() => handleViewPost(warning.related_post_id)}>
                            View related post
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted p-3 rounded-md">{warning.reason}</p>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    {warning.expires_at && (
                      <span>Expires: {new Date(warning.expires_at).toLocaleDateString()}</span>
                    )}
                    {warning.related_post_id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-6 px-2"
                        onClick={() => handleViewPost(warning.related_post_id)}
                      >
                        View Related Post
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default WarningsManagement;
