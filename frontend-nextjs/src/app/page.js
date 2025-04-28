'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { bonsaiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import NewBonsaiUpload from '@/components/new-bonsai-upload';
import { toast } from 'sonner';

export default function Home() {
  const [bonsais, setBonsais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const observer = useRef();
  const ITEMS_PER_PAGE = 5; // Number of items to load per page

  // This function will be attached to the last bonsai item
  const lastBonsaiElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // When the last element is visible and there's more data to load
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    // Fetch bonsais when component mounts and user is authenticated
    if (isAuthenticated) {
      fetchBonsais();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load more bonsais when page changes
  useEffect(() => {
    if (page > 1 && isAuthenticated) {
      loadMoreBonsais();
    }
  }, [page, isAuthenticated]);

  const fetchBonsais = async () => {
    try {
      setLoading(true);
      const response = await bonsaiApi.getAllBonsais();
      setBonsais(response.data.slice(0, ITEMS_PER_PAGE));
      setHasMore(response.data.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching bonsais:', error);
      toast.error('Failed to load bonsais');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreBonsais = async () => {
    try {
      setLoading(true);
      const response = await bonsaiApi.getAllBonsais();
      const allBonsais = response.data;
      const nextBonsais = allBonsais.slice(0, page * ITEMS_PER_PAGE);
      setBonsais(nextBonsais);
      setHasMore(nextBonsais.length < allBonsais.length);
    } catch (error) {
      console.error('Error loading more bonsais:', error);
      toast.error('Failed to load more bonsais');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bonsai Collection</h1>
        </div>
        
        {/* Floating action button for adding new bonsai */}
        <NewBonsaiUpload onBonsaiCreated={fetchBonsais} />

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
            <p className="text-slate-600 text-sm">
              Click the + button in the bottom right to upload a bonsai image
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 pb-20">
            {bonsais.map((bonsai, index) => {
              // Determine if this is the last item to attach the ref for infinite scrolling
              const isLastItem = index === bonsais.length - 1;
              return (
                <Card 
                  key={bonsai.id} 
                  className="overflow-hidden w-full max-w-md mx-auto shadow-md"
                  ref={isLastItem ? lastBonsaiElementRef : null}
                >
                  <CardHeader className="pb-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium">{bonsai.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 p-0 h-8 w-8"
                      onClick={() => handleDelete(bonsai.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </Button>
                  </CardHeader>
                  <Link href={`/bonsai/${bonsai.id}`}>
                    <div className="aspect-square overflow-hidden bg-slate-100">
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
                  </Link>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-600">
                      {bonsai.description ? (
                        bonsai.description.length > 100 ? 
                          `${bonsai.description.substring(0, 100)}...` : 
                          bonsai.description
                      ) : 'No description provided'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Link href={`/bonsai/${bonsai.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
            {loading && hasMore && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
