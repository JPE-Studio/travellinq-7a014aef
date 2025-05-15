
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, X, AlertTriangle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboardLayout from "@/components/admin/DashboardLayout";
import { fetchPostReports, updatePostReport } from "@/services/adminService";
import { hidePost, warnUser } from "@/services/moderationService";
import { ModerationDialog } from '@/components/moderation/ModerationDialog';
import { useUserRole } from '@/hooks/useUserRole';

const ReportsManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const navigate = useNavigate();
  const { isAtLeastRole } = useUserRole();
  
  const isModerator = isAtLeastRole('moderator');
  
  const { 
    data: reports = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['reports', statusFilter],
    queryFn: () => fetchPostReports(statusFilter),
  });

  const handleResolvingReport = async (
    reportId: string, 
    status: 'resolved' | 'rejected',
    resolution_notes?: string,
    resolution_action?: string
  ) => {
    try {
      const success = await updatePostReport(reportId, status, resolution_notes, resolution_action);
      
      if (success) {
        toast({
          title: `Report ${status === 'resolved' ? 'resolved' : 'rejected'}`,
          description: `The report has been marked as ${status}.`,
        });
        
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to update the report status.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error ${status} report:`, error);
      toast({
        title: "Error",
        description: "Failed to update the report status.",
        variant: "destructive"
      });
    }
  };
  
  const handleHidePost = async (reason: string) => {
    try {
      if (!selectedReport || !selectedReport.post) return;
      
      const success = await hidePost(selectedReport.post.id, reason);
      
      if (success) {
        toast({
          title: "Post hidden",
          description: "The post has been hidden from regular users.",
        });
        
        // Resolve the report
        await handleResolvingReport(
          selectedReport.id, 
          'resolved', 
          `Post hidden: ${reason}`,
          'hide_post'
        );
      } else {
        toast({
          title: "Action failed",
          description: "Failed to hide the post.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error hiding post:", error);
      toast({
        title: "Action failed",
        description: "Failed to hide the post.",
        variant: "destructive"
      });
    }
    
    setIsHideDialogOpen(false);
    setSelectedReport(null);
  };
  
  const handleWarnUser = async (reason: string, severity: 'minor' | 'moderate' | 'severe') => {
    try {
      if (!selectedReport || !selectedReport.post) return;
      
      const success = await warnUser(
        selectedReport.post.author_id,
        reason,
        severity,
        selectedReport.post.id
      );
      
      if (success) {
        toast({
          title: "Warning issued",
          description: "The user has been warned for this post.",
        });
        
        // Resolve the report
        await handleResolvingReport(
          selectedReport.id, 
          'resolved', 
          `User warned: ${reason} (${severity})`,
          'warn_user'
        );
      } else {
        toast({
          title: "Action failed",
          description: "Failed to warn the user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error warning user:", error);
      toast({
        title: "Action failed",
        description: "Failed to warn the user.",
        variant: "destructive"
      });
    }
    
    setIsWarnDialogOpen(false);
    setSelectedReport(null);
  };
  
  const handleRejectReport = async (reportId: string) => {
    await handleResolvingReport(reportId, 'rejected', 'No action needed', 'none');
  };

  return (
    <AdminDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Reports</h2>
          <p className="text-muted-foreground">Review and manage reported content.</p>
        </div>
      </div>
      
      <Tabs defaultValue="posts" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments" disabled>Comments</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="posts">
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <h3 className="font-semibold">Error Loading Reports</h3>
                <p>Failed to load reports. Please try again.</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/30">
              <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-semibold text-lg">No Reports Found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'pending' 
                  ? "There are no pending reports to review."
                  : statusFilter === 'all' 
                    ? "No reports have been submitted yet."
                    : `No reports with status '${statusFilter}' found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={report.status === 'pending' ? 'outline' : (report.status === 'resolved' ? 'default' : 'secondary')}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Reported {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg cursor-pointer hover:underline" 
                        onClick={() => report.post && navigate(`/post/${report.post.id}`)}
                      >
                        {report.post ? report.post.text?.substring(0, 100) + (report.post.text?.length > 100 ? '...' : '') : 'Post not found'}
                      </h3>
                      
                      <div className="bg-muted p-3 rounded-md mt-2">
                        <p className="text-sm font-medium">Report Reason:</p>
                        <p className="text-sm">{report.reason}</p>
                      </div>
                      
                      {report.resolution_notes && (
                        <div className="bg-primary/10 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium">Resolution:</p>
                          <p className="text-sm">{report.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {report.status === 'pending' && isModerator && (
                        <>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsHideDialogOpen(true);
                            }}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Hide Post
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsWarnDialogOpen(true);
                            }}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Warn User
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleRejectReport(report.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject Report
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="secondary"
                        className="w-full"
                        onClick={() => report.post && navigate(`/post/${report.post.id}`)}
                      >
                        View Post
                      </Button>
                      
                      {report.reporter && (
                        <Button 
                          variant="ghost"
                          className="w-full"
                          onClick={() => navigate(`/user/${report.reporter.id}`)}
                        >
                          View Reporter
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments">
          <div className="text-center p-8 border rounded-md bg-muted/30">
            <h3 className="font-semibold text-lg">Coming Soon</h3>
            <p className="text-muted-foreground">Comment reporting is not implemented yet.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <ModerationDialog
        type="hide"
        contentType="post"
        isOpen={isHideDialogOpen}
        onOpenChange={setIsHideDialogOpen}
        onAction={handleHidePost}
      />
      
      <ModerationDialog
        type="warn"
        contentType="post"
        isOpen={isWarnDialogOpen}
        onOpenChange={setIsWarnDialogOpen}
        onAction={handleWarnUser}
      />
    </AdminDashboardLayout>
  );
};

export default ReportsManagement;
