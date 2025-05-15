
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Clock, Loader2, Trash2 } from "lucide-react";
import DashboardLayout from '@/components/admin/DashboardLayout';
import { getUserWarnings, removeUserWarning } from '@/services/moderationService';
import { formatDistanceToNow } from 'date-fns';

const WarningsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [warningToRemove, setWarningToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const {
    data: warnings = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin', 'warnings'],
    queryFn: getUserWarnings
  });
  
  const handleRemoveWarning = async () => {
    if (!warningToRemove) return;
    
    try {
      setIsRemoving(true);
      await removeUserWarning(warningToRemove);
      
      toast({
        title: "Warning Removed",
        description: "The user warning has been successfully removed."
      });
      
      // Refresh warnings list
      queryClient.invalidateQueries({ queryKey: ['admin', 'warnings'] });
    } catch (error) {
      console.error("Error removing warning:", error);
      toast({
        title: "Error",
        description: "Failed to remove the warning. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
      setWarningToRemove(null);
    }
  };
  
  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'minor':
        return <Badge variant="outline">Minor</Badge>;
      case 'moderate':
        return <Badge variant="warning">Moderate</Badge>;
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };
  
  // Format expiry date if present
  const formatExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return "Never";
    return formatDistanceToNow(new Date(expiryDate), { addSuffix: true });
  };
  
  return (
    <DashboardLayout title="User Warnings">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">User Warnings Management</h1>
        
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Active User Warnings</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-destructive">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>Failed to load warnings. Please try again.</p>
            </div>
          ) : warnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active warnings found.</p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of active user warnings.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warnings.map((warning) => (
                  <TableRow key={warning.id}>
                    <TableCell>{warning.user_pseudonym}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={warning.reason}>
                      {warning.reason}
                    </TableCell>
                    <TableCell>{getSeverityBadge(warning.severity)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(warning.created_at), { addSuffix: true })}</TableCell>
                    <TableCell>
                      {warning.expires_at ? (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatExpiry(warning.expires_at)}</span>
                        </div>
                      ) : (
                        <span>Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setWarningToRemove(warning.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
      
      {/* Confirmation dialog for removing warning */}
      <AlertDialog 
        open={!!warningToRemove} 
        onOpenChange={(open) => !open && setWarningToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this user warning? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveWarning} 
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Warning"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default WarningsManagement;
