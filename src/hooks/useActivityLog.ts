import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>
  ) => {
    if (!user) return;

    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_data: oldData as Json,
        new_data: newData as Json,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
}
