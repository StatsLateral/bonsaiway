'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { bonsaiApi, aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/navigation';
import ImageUpload from '@/components/image-upload';
import AIInsightsForm from '@/components/ai-insights-form';
import InsightCard from '@/components/insight-card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function BonsaiDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [bonsai, setBonsai] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (params.id) {
      fetchBonsai();
      fetchInsights();
    }
  }, [params.id, isAuthenticated]);

  const fetchBonsai = async () => {
    try {
      setLoading(true);
      const response = await bonsaiApi.getBonsai(params.id);
      setBonsai(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error fetching bonsai:', error);
      toast.error('Failed to load bonsai details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await aiApi.getBonsaiInsights(params.id);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load AI insights');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setAskingQuestion(true);
      await aiApi.createInsight(params.id, { user_question: question });
      toast.success('AI is analyzing your question');
      setQuestion('');
      // Fetch updated insights
      await fetchInsights();
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to process your question');
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleDeleteInsight = async (insightId) => {
    if (!window.confirm('Are you sure you want to delete this insight?')) return;

    try {
      await aiApi.deleteInsight(params.id, insightId);
      toast.success('Insight deleted successfully');
      // Update insights list
      setInsights(insights.filter((insight) => insight.id !== insightId));
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('Failed to delete insight');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG or PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
  };

  const handleImageSubmit = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      await bonsaiApi.uploadImage(params.id, formData);
      toast.success('Image uploaded successfully');
      // Refresh bonsai data to show new image
      await fetchBonsai();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await bonsaiApi.deleteImage(params.id, imageId);
      toast.success('Image deleted successfully');
      // Refresh bonsai data
      await fetchBonsai();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleUpdateBonsai = async () => {
    try {
      await bonsaiApi.updateBonsai(params.id, editData);
      toast.success('Bonsai updated successfully');
      setEditMode(false);
      // Refresh bonsai data
      await fetchBonsai();
    } catch (error) {
      console.error('Error updating bonsai:', error);
      toast.error('Failed to update bonsai');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Collection
            </Button>
          </Link>
        </div>

        {/* Bonsai Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Images Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bonsai.images && bonsai.images.length > 0 ? (
                  <div className="space-y-4">
                    {bonsai.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.image_url}
                          alt={bonsai.title}
                          className="w-full rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-100 rounded-md">
                    <p className="text-slate-500">No images yet</p>
                  </div>
                )}

                <div className="pt-4">
                  <Label className="mb-2 block">Upload New Image</Label>
                  <ImageUpload 
                    onUpload={handleImageSubmit} 
                    disabled={uploadingImage} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">
                  {editMode ? 'Edit Bonsai' : bonsai.title}
                </CardTitle>
                {!editMode && (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                        rows={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateBonsai}>Save Changes</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          setEditData({
                            title: bonsai.title,
                            description: bonsai.description || '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 whitespace-pre-line">
                      {bonsai.description || 'No description provided.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">AI Care Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <AIInsightsForm 
                  bonsaiId={params.id} 
                  onInsightCreated={fetchInsights} 
                />

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Previous Insights</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.length > 0 ? (
                      insights.map((insight) => (
                        <InsightCard 
                          key={insight.id} 
                          insight={insight} 
                          onDelete={handleDeleteInsight} 
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 bg-slate-100 rounded-md md:col-span-2">
                        <p className="text-slate-500">
                          No insights yet. Ask a question about your bonsai!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
