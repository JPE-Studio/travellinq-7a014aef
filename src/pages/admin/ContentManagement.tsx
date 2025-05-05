
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Tag } from 'lucide-react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { getHashtags } from '@/services/adminService';
import { HashtagData } from '@/types/roles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

const ContentManagement: React.FC = () => {
  const [newHashtag, setNewHashtag] = React.useState('');

  const { data: hashtags, isLoading, error, refetch } = useQuery({
    queryKey: ['hashtags'],
    queryFn: getHashtags,
  });

  const handleAddHashtag = () => {
    // This would be implemented with a createHashtag function
    console.log("Adding hashtag:", newHashtag);
    setNewHashtag('');
  };

  return (
    <DashboardLayout title="Content Management">
      <div className="space-y-6">
        <Tabs defaultValue="hashtags">
          <TabsList>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="hashtags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Hashtags</CardTitle>
                <CardDescription>
                  View and manage all hashtags used in posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Input 
                    placeholder="New hashtag..." 
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                  />
                  <Button onClick={handleAddHashtag}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    <p>Error loading hashtags</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hashtag</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hashtags?.map((hashtag: HashtagData) => (
                        <TableRow key={hashtag.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                              {hashtag.name}
                            </div>
                          </TableCell>
                          <TableCell>{hashtag.post_count}</TableCell>
                          <TableCell>{new Date(hashtag.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Posts
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {hashtags?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No hashtags found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Post Categories</CardTitle>
                <CardDescription>
                  System-defined categories for posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>campsite</TableCell>
                      <TableCell>Posts about camping locations and sites</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>service</TableCell>
                      <TableCell>Posts about services for travelers</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>question</TableCell>
                      <TableCell>Questions from travelers</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>general</TableCell>
                      <TableCell>General posts and updates</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentManagement;
