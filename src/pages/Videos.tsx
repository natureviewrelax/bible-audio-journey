import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
}

const videos: Video[] = [
  {
    id: 'Fhk-MSOIGl8',
    title: 'A Jornada de Jó',
    description: 'Uma história de fé inabalável e perseverança diante das adversidades.',
    url: 'https://www.youtube.com/watch?v=Fhk-MSOIGl8'
  },
  {
    id: 'zzDZeNhmqeg',
    title: 'O Poder da Oração',
    description: 'Descobrindo a força transformadora da conexão com Deus através da oração.',
    url: 'https://www.youtube.com/watch?v=zzDZeNhmqeg'
  },
  {
    id: 'zYutONgU3fg',
    title: 'Parábolas de Jesus',
    description: 'Ensinamentos profundos através das histórias contadas por Jesus.',
    url: 'https://www.youtube.com/watch?v=zYutONgU3fg'
  }
];

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Jornada Bíblica em Vídeo</h1>
      
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
                    {videos.find(v => v.id === selectedVideo)?.title}
                  </h2>
                  <p className="text-gray-600">
                    {videos.find(v => v.id === selectedVideo)?.description}
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
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedVideo === video.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedVideo(video.id)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
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
    </div>
  );
}