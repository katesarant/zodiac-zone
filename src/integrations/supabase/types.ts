export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_config: {
        Row: {
          id: string
          password: string
          updated_at: string
        }
        Insert: {
          id?: string
          password: string
          updated_at?: string
        }
        Update: {
          id?: string
          password?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          lang: string
          message: string
          name: string
          sender_hash: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lang?: string
          message: string
          name: string
          sender_hash?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lang?: string
          message?: string
          name?: string
          sender_hash?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      horoscope_cron_config: {
        Row: {
          created_at: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      horoscopes: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          key: string
          lang: string
          period: string
          signs: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          key: string
          lang: string
          period: string
          signs: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          key?: string
          lang?: string
          period?: string
          signs?: Json
        }
        Relationships: []
      }
      instagram_config: {
        Row: {
          access_token: string | null
          enabled: boolean
          id: string
          ig_user_id: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          enabled?: boolean
          id?: string
          ig_user_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          enabled?: boolean
          id?: string
          ig_user_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          created_at: string
          day: string
          error: string | null
          id: string
          image_url: string | null
          lang: string
          media_id: string | null
          sign: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day: string
          error?: string | null
          id?: string
          image_url?: string | null
          lang?: string
          media_id?: string | null
          sign: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day?: string
          error?: string | null
          id?: string
          image_url?: string | null
          lang?: string
          media_id?: string | null
          sign?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      interpretations: {
        Row: {
          chart_hash: string
          content: Json
          created_at: string | null
          kind: string
          lang: string
        }
        Insert: {
          chart_hash: string
          content: Json
          created_at?: string | null
          kind: string
          lang: string
        }
        Update: {
          chart_hash?: string
          content?: Json
          created_at?: string | null
          kind?: string
          lang?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          day: string
          id: number
          lang: string | null
          path: string
          referrer_host: string | null
        }
        Insert: {
          created_at?: string
          day?: string
          id?: number
          lang?: string | null
          path: string
          referrer_host?: string | null
        }
        Update: {
          created_at?: string
          day?: string
          id?: number
          lang?: string | null
          path?: string
          referrer_host?: string | null
        }
        Relationships: []
      }
      publish_events: {
        Row: {
          build_stamp: string
          calendar_event_id: string | null
          detected_at: string
          id: string
        }
        Insert: {
          build_stamp: string
          calendar_event_id?: string | null
          detected_at?: string
          id?: string
        }
        Update: {
          build_stamp?: string
          calendar_event_id?: string | null
          detected_at?: string
          id?: string
        }
        Relationships: []
      }
      publish_watch_config: {
        Row: {
          id: boolean
          token: string
        }
        Insert: {
          id?: boolean
          token: string
        }
        Update: {
          id?: boolean
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
