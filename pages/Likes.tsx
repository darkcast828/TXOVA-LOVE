import React from 'react';
import { Button } from '../components/ui';
import { MessageCircle, Heart, MapPin } from 'lucide-react';
import { MOCK_PROFILES } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Likes: React.FC = () => {
  const navigate = useNavigate();
  // Simulating a list of people who liked the user (using existing mocks)
  const likers = [MOCK_PROFILES[2], MOCK_PROFILES[4], MOCK_PROFILES[5], MOCK_PROFILES[6]].filter(Boolean);

  return (
    <div className="p-4 pt-6">
       <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand-pink/10 p-2.5 rounded-full">
            <Heart className="text-brand-pink fill-current" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-800">Interessados</h2>
            <p className="text-xs text-gray-500 font-medium">Pessoas que gostaram do teu perfil</p>
          </div>
       </div>
       
       {/* Grid of Profiles - Fully Visible */}
       <div className="grid grid-cols-2 gap-4 pb-20">
          {likers.map(profile => (
             <div key={profile.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative">
                
                {/* Image Section */}
                <div className="relative aspect-[4/5] bg-gray-100">
                  <img 
                    src={profile.photos[0]} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={profile.name} 
                  />
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
                     <h3 className="text-white font-bold text-lg leading-tight flex items-center justify-between">
                        {profile.name}, {profile.age}
                     </h3>
                     <div className="flex items-center gap-1 text-gray-200 text-xs mt-0.5">
                        <MapPin size={10} />
                        <span className="truncate max-w-[90%]">{profile.city}</span>
                     </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-3 bg-white">
                   <Button 
                     variant="primary"
                     className="w-full py-2.5 text-xs shadow-none"
                     onClick={() => navigate(`/chat/${profile.id}`)}
                   >
                     <MessageCircle size={16} />
                     Conversar
                   </Button>
                </div>
             </div>
          ))}
       </div>

       {likers.length === 0 && (
          <div className="text-center py-16 px-6">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-gray-300" size={40} />
             </div>
             <h3 className="text-gray-800 font-bold mb-2">Ainda sem curtidas</h3>
             <p className="text-gray-500 text-sm">
                Mantém o teu perfil atualizado e com boas fotos para apareceres para mais pessoas!
             </p>
          </div>
       )}
    </div>
  )
};