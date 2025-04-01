
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos from Supabase
  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from('bible_videos')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setVideos(data);
          // Select a random video initially
          const randomIndex = Math.floor(Math.random() * data.length);
          setSelectedVideo(data[randomIndex].youtube_id);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Não foi possível carregar os vídeos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Voltar para Início
        </Link>
        <h1 className="text-3xl font-bold text-center text-gray-800">Jornada Bíblica em Vídeo</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando vídeos...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player Section */}
          <div className="lg:w-2/3">
            {selectedVideo ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                {selectedVideo && (
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      {videos.find(v => v.youtube_id === selectedVideo)?.title}
                    </h2>
                    <p className="text-gray-600">
                      {videos.find(v => v.youtube_id === selectedVideo)?.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] bg-white rounded-xl shadow-lg">
                <p className="text-gray-500 text-lg">Selecione um vídeo para começar</p>
              </div>
            )}
          </div>

          {/* Video List Section */}
          <div className="lg:w-1/3 space-y-4">
            {videos.map((video) => (
              <Card
                key={video.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedVideo === video.youtube_id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedVideo(video.youtube_id)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                      <p className="text-sm text-gray-200 line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
