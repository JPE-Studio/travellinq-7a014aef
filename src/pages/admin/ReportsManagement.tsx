
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, MoreVertical, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { fetchPostReports, updatePostReport, blockUser } from '@/services/adminService';
import { PostReport } from '@/types/roles';
import { useMediaQuery } from '@/hooks/use-mobile';

const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<PostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadReports = async (status: string = '') => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading reports with status:", status || "all");
      const data = await fetchPostReports(status);
      console.log("Reports loaded:", data);
      setReports(data);
    } catch (err: any) {
      console.error("Error loading reports:", err);
      setError(err.message || "Failed to load reports");
      toast({
        variant: "destructive",
        title: "Error loading reports",
        description: err.message || "There was a problem loading the reports. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
    loadReports(activeTab !== 'all' ? activeTab : '');
  }, [activeTab]);

  const handleViewReport = (report: PostReport) => {
    setSelectedReport(report);
    setNotes(report.resolution_notes || '');
    setAction(report.resolution_action || '');
    setDialogOpen(true);
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'rejected') => {
    try {
      setSubmitting(true);
      await updatePostReport(reportId, status, notes, action);
      toast({
        title: "Report updated",
        description: `The report has been ${status}.`,
      });
      setDialogOpen(false);
      loadReports(activeTab !== 'all' ? activeTab : '');
    } catch (err: any) {
      console.error("Error updating report:", err);
      toast({
        title: "Update failed",
        description: err.message || "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      setSubmitting(true);
      await blockUser(userId, true);
      toast({
        title: "User blocked",
        description: "The user has been blocked.",
      });
      // Update action for record keeping
      setAction(prev => `${prev}; User blocked`);
    } catch (err: any) {
      console.error("Error blocking user:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    loadReports(activeTab !== 'all' ? activeTab : '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Reports Management">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <p className="mb-2">{error}</p>
                <Button onClick={handleRetry} size="sm" variant="outline">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : reports.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              <p>No reports found with status: {activeTab === 'all' ? 'any' : activeTab}</p>
            </div>
          ) : isMobile ? (
            // Card layout for mobile
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <CardTitle className="text-lg mt-1">
                          {report.reporter?.pseudonym || 'Anonymous'}
                        </CardTitle>
                      </div>
                      <div>{getStatusBadge(report.status)}</div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <p className="text-sm truncate font-medium">Reason:</p>
                    <p className="text-sm mb-4">{report.reason}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // Table layout for desktop
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{report.reporter?.pseudonym || 'Anonymous'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={report.reason}>
                        {report.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedReport && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Review and take action on this report.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Report Date:</h4>
                <p>{new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Reported By:</h4>
                <p>{selectedReport.reporter?.pseudonym || 'Anonymous'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Status:</h4>
                <p>{getStatusBadge(selectedReport.status)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Reason for Report:</h4>
                <p className="border rounded-md p-2 bg-muted">{selectedReport.reason}</p>
              </div>
              
              {selectedReport.post && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Reported Content:</h4>
                  <div className="border rounded-md p-2 bg-muted">
                    <p className="mb-1 font-medium">Post by: {selectedReport.post.author_id}</p>
                    <p>{selectedReport.post.text}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">Moderation Notes:</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Action Taken:</h4>
                <Textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Describe actions taken..."
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <div>
                  {selectedReport.post && (
                    <Button
                      variant="destructive"
                      disabled={submitting}
                      onClick={() => handleBlockUser(selectedReport.post.author_id)}
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Block User
                    </Button>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    disabled={submitting || selectedReport.status !== 'pending'}
                    onClick={() => handleResolveReport(selectedReport.id, 'rejected')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    disabled={submitting || selectedReport.status !== 'pending'}
                    onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default ReportsManagement;
