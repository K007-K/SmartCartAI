export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comparison_history: {
        Row: {
          created_at: string
          id: string
          name: string
          products: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          products: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          products?: Json
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          id: string
          price: number
          product_id: string
          recorded_at: string | null
        }
        Insert: {
          id?: string
          price: number
          product_id: string
          recorded_at?: string | null
        }
        Update: {
          id?: string
          price?: number
          product_id?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_text: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_text: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_text?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_insights_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          about_product: Json | null
          asin: string
          availability: string | null
          created_at: string | null
          current_price: number | null
          customers_say: string | null
          description: string | null
          id: string
          image_url: string | null
          images: Json | null
          num_ratings: number | null
          original_price: number | null
          product_details: Json | null
          product_information: Json | null
          rating: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          about_product?: Json | null
          asin: string
          availability?: string | null
          created_at?: string | null
          current_price?: number | null
          customers_say?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          num_ratings?: number | null
          original_price?: number | null
          product_details?: Json | null
          product_information?: Json | null
          rating?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          about_product?: Json | null
          asin?: string
          availability?: string | null
          created_at?: string | null
          current_price?: number | null
          customers_say?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          num_ratings?: number | null
          original_price?: number | null
          product_details?: Json | null
          product_information?: Json | null
          rating?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          alert_enabled: boolean | null
          alert_price: number | null
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          alert_price?: number | null
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          alert_price?: number | null
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_chat_session: {
        Args: {
          p_user_id: string
          p_product_id: string
        }
        Returns: {
          id: string
        }[]
      }
      save_chat_messages: {
        Args: {
          p_messages: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
