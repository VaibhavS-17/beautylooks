import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center py-20 animate-in fade-in duration-500">
      <Loader2 className="animate-spin text-[#C9A94E]" size={40} />
    </div>
  );
}
