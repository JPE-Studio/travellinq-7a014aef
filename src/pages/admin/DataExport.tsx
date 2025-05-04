
import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { exportTopContributors, getHashtags } from '@/services/adminService';
import { UserExport, HashtagData } from '@/types/roles';

const DataExport: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHashtags, setLoadingHashtags] = useState<boolean>(false);
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);

  const handleExportContributors = async () => {
    try {
      setLoading(true);
      const data = await exportTopContributors(50);
      downloadCSV(data, 'top-contributors');
      
      toast({
        title: "Export successful",
        description: `${data.length} contributors have been exported.`,
      });
    } catch (err: any) {
      console.error("Error exporting contributors:", err);
      toast({
        title: "Export failed",
        description: err.message || "Failed to export contributors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHashtags = async () => {
    try {
      setLoadingHashtags(true);
      const data = await getHashtags();
      setHashtags(data);
    } catch (err: any) {
      console.error("Error loading hashtags:", err);
      toast({
        title: "Failed to load hashtags",
        description: err.message || "An error occurred while loading hashtags",
        variant: "destructive",
      });
    } finally {
      setLoadingHashtags(false);
    }
  };

  const handleExportHashtags = () => {
    if (hashtags.length === 0) {
      toast({
        title: "No hashtags to export",
        description: "Please load hashtags first.",
        variant: "destructive",
      });
      return;
    }
    
    downloadCSV(hashtags, 'hashtags');
    
    toast({
      title: "Export successful",
      description: `${hashtags.length} hashtags have been exported.`,
    });
  };

  const downloadCSV = (data: any[], filename: string) => {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header];
          // Handle strings that might contain commas
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      )
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Data Export">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>
              Export the top 50 users based on posts, comments, and votes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportContributors}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hashtag Data</CardTitle>
            <CardDescription>
              Export a list of all hashtags and their usage counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashtags.length > 0 ? (
              <div className="border rounded-md p-3 h-48 overflow-y-auto bg-muted/30">
                <ul className="space-y-1">
                  {hashtags.map((tag) => (
                    <li key={tag.id} className="flex justify-between text-sm">
                      <span>#{tag.name}</span>
                      <span className="text-muted-foreground">{tag.post_count} posts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={handleLoadHashtags}
                disabled={loadingHashtags}
                className="w-full"
              >
                {loadingHashtags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Load Hashtags
              </Button>
            )}
            
            <Button 
              onClick={handleExportHashtags}
              disabled={loadingHashtags || hashtags.length === 0}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Hashtags
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataExport;
