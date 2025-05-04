
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/roles";

// Check if a user has a specific role
export const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('has_role', { 
        _user_id: userId, 
        _role: role 
      });
    
    if (error) {
      console.error("Error checking role:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Error in hasRole:", error);
    return false;
  }
};

// Check if a user has any of the specified roles
export const hasAnyRole = async (userId: string, roles: UserRole[]): Promise<boolean> => {
  try {
    // The database function accepts a variadic parameter
    const { data, error } = await supabase
      .rpc('has_any_role', { 
        _user_id: userId,
        roles: roles // Match the parameter name expected by the database function
      });
    
    if (error) {
      console.error("Error checking roles:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Error in hasAnyRole:", error);
    return false;
  }
};

// Get all roles for a user
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_roles', { 
        _user_id: userId 
      });
    
    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    return [];
  }
};

// Assign a role to a user
export const assignRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) {
      console.error("Error assigning role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignRole:", error);
    return false;
  }
};

// Remove a role from a user
export const removeRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) {
      console.error("Error removing role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeRole:", error);
    return false;
  }
};

// Get all users with their roles
export const getUsersWithRoles = async (): Promise<any[]> => {
  try {
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }

    // Then get all roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      return [];
    }

    // Combine the data
    const usersWithRoles = profiles.map(profile => {
      const userRoles = roles
        .filter(r => r.user_id === profile.id)
        .map(r => r.role);
      
      return {
        ...profile,
        roles: userRoles.length > 0 ? userRoles : ['user']
      };
    });
    
    return usersWithRoles;
  } catch (error) {
    console.error("Error in getUsersWithRoles:", error);
    return [];
  }
};
