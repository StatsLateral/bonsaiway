'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { bonsaiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import { toast } from 'sonner';

export default function Home() {
  const [bonsais, setBonsais] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch bonsais when component mounts and user is authenticated
    if (isAuthenticated) {
      fetchBonsais();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBonsais = async () => {
    try {
      setLoading(true);
      const response = await bonsaiApi.getAllBonsais();
      setBonsais(response.data);
    } catch (error) {
      console.error('Error fetching bonsais:', error);
      toast.error('Failed to load bonsais');
    } finally {
      setLoading(false);
    }
  };

  // Handle bonsai deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bonsai?')) {
      try {
        await bonsaiApi.deleteBonsai(id);
        toast.success('Bonsai deleted successfully');
        // Refresh the list
        fetchBonsais();
      } catch (error) {
        console.error('Error deleting bonsai:', error);
        toast.error('Failed to delete bonsai');
      }
    }
  };

  // If not authenticated, show welcome screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome to BonsaiWay
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Your digital companion for bonsai care and cultivation. Track your bonsai collection,
              get AI-powered care insights, and join a community of bonsai enthusiasts.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bonsai Collection</h1>
          <Link href="/bonsai/new">
            <Button>Add New Bonsai</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : bonsais.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No bonsais yet</h2>
            <p className="text-slate-600 mb-6">
              Start by adding your first bonsai to your collection.
            </p>
            <Link href="/bonsai/new">
              <Button>Add Your First Bonsai</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonsais.map((bonsai) => (
              <Card key={bonsai.id} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl">{bonsai.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="aspect-square overflow-hidden rounded-md bg-slate-100 mb-4">
                    {bonsai.images && bonsai.images.length > 0 ? (
                      <img
                        src={bonsai.images[0].image_url}
                        alt={bonsai.title}
                        className="h-full w-full object-cover transition-all hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-200">
                        <span className="text-sm text-slate-500">No image</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {bonsai.description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/bonsai/${bonsai.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Button variant="destructive" onClick={() => handleDelete(bonsai.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
