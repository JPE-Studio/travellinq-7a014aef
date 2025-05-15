
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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle, Eye, Loader2 } from "lucide-react";
import DashboardLayout from '@/components/admin/DashboardLayout';
import { hideComment, hidePost } from '@/services/moderationService';
import { formatDistanceToNow } from 'date-fns';

// Mock functions for reports until they're implemented in moderationService
const getReports = async (status: 'pending' | 'resolved') => {
  // This is a placeholder until the real implementation
  console.log(`Fetching ${status} reports`);
  return [];
};

const resolveReport = async (reportId: string, action: string, notes: string) => {
  // This is a placeholder until the real implementation
  console.log(`Resolving report ${reportId} with action ${action} and notes: ${notes}`);
  return true;
};

const ReportsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("pending");
  
  // Dialog states
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState("none");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get reports data
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'reports', activeTab],
    queryFn: () => getReports(activeTab as 'pending' | 'resolved'),
  });
  
  // Handle view report details click
  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
    setResolutionAction("none");
    setResolutionNotes("");
  };
  
  // Handle resolution submission
  const handleResolveReport = async () => {
    if (!selectedReport) return;
    
    try {
      setIsSubmitting(true);
      
      // Handle actions
      if (resolutionAction === "hide_post") {
        // Hide the post
        await hidePost(
          selectedReport.post_id, 
          `Hidden due to report: ${selectedReport.reason}`
        );
        
        toast({
          title: "Post Hidden",
          description: "The post has been hidden successfully.",
        });
      }
      else if (resolutionAction === "hide_comment") {
        // Hide the comment
        await hideComment(
          selectedReport.comment_id, 
          `Hidden due to report: ${selectedReport.reason}`
        );
        
        toast({
          title: "Comment Hidden",
          description: "The comment has been hidden successfully.",
        });
      }
      
      // Resolve the report
      await resolveReport(selectedReport.id, resolutionAction, resolutionNotes);
      
      // Success toast
      toast({
        title: "Report Resolved",
        description: "The report has been successfully processed.",
      });
      
      // Refresh data and close dialog
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports', activeTab] });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error resolving report:", error);
      toast({
        title: "Error",
        description: "Failed to process the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine if resolve button should be disabled
  const isResolveDisabled = 
    isSubmitting || 
    (activeTab === "resolved") || 
    (resolutionAction === "none" && !resolutionNotes);
  
  return (
    <DashboardLayout title="Reports Management">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Content Reports</h1>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Pending Reports</h2>
              {renderReportsTable(reports, isLoading, error, handleViewReport, "pending")}
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Resolved Reports</h2>
              {renderReportsTable(reports, isLoading, error, handleViewReport, "resolved")}
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Report Details Dialog */}
        {selectedReport && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>
                  Reported {selectedReport.post_id ? "post" : "comment"} by {selectedReport.reporter_pseudonym}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Reason</h4>
                  <p className="text-sm bg-muted p-2 rounded">{selectedReport.reason}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Content</h4>
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedReport.post_content || selectedReport.comment_content}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Author</h4>
                  <p className="text-sm">{selectedReport.author_pseudonym}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Reported</h4>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                {activeTab === "pending" && (
                  <>
                    <div>
                      <label className="font-medium mb-1 block">Action</label>
                      <Select value={resolutionAction} onValueChange={setResolutionAction}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Action Required</SelectItem>
                          {selectedReport.post_id && (
                            <SelectItem value="hide_post">Hide Post</SelectItem>
                          )}
                          {selectedReport.comment_id && (
                            <SelectItem value="hide_comment">Hide Comment</SelectItem>
                          )}
                          <SelectItem value="warn_user">Warn User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="font-medium mb-1 block">Notes</label>
                      <Textarea
                        placeholder="Add resolution notes here..."
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResolveReport}
                        disabled={isResolveDisabled}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Resolve Report"
                        )}
                      </Button>
                    </div>
                  </>
                )}
                
                {activeTab === "resolved" && selectedReport.resolution_notes && (
                  <div>
                    <h4 className="font-medium mb-1">Resolution Notes</h4>
                    <p className="text-sm bg-muted p-2 rounded">
                      {selectedReport.resolution_notes}
                    </p>
                  </div>
                )}
                
                {activeTab === "resolved" && selectedReport.resolution_action && (
                  <div>
                    <h4 className="font-medium mb-1">Action Taken</h4>
                    <Badge variant={
                      selectedReport.resolution_action === "none" ? "outline" :
                      selectedReport.resolution_action === "warn_user" ? "secondary" :
                      "destructive"
                    }>
                      {selectedReport.resolution_action === "none" ? "No Action" :
                       selectedReport.resolution_action === "hide_post" ? "Post Hidden" :
                       selectedReport.resolution_action === "hide_comment" ? "Comment Hidden" :
                       selectedReport.resolution_action === "warn_user" ? "User Warned" :
                       selectedReport.resolution_action}
                    </Badge>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

// Helper to render the reports table
const renderReportsTable = (
  reports: any[], 
  isLoading: boolean, 
  error: any, 
  handleViewReport: (report: any) => void,
  status: string
) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Failed to load reports. Please try again.</p>
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No {status} reports found.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableCaption>List of {status} content reports.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Reporter</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <Badge variant="outline">
                {report.post_id ? "Post" : "Comment"}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={report.reason}>
              {report.reason}
            </TableCell>
            <TableCell>{report.reporter_pseudonym || "Anonymous"}</TableCell>
            <TableCell>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReportsManagement;
