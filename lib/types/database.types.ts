export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'user'
export type GroupMemberRole = 'leader' | 'member'
export type ItineraryCategory = 'transport' | 'accommodation' | 'activity' | 'food' | 'other'
export type DocumentType = 'flight' | 'bus' | 'train' | 'hotel' | 'activity' | 'other'
export type ExpenseSplitType = 'equal' | 'percentage' | 'custom'
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      travel_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          destination: string | null
          start_date: string | null
          end_date: string | null
          cover_image: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_image?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_image?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: GroupMemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: GroupMemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: GroupMemberRole
          joined_at?: string
        }
      }
      itinerary_items: {
        Row: {
          id: string
          group_id: string
          title: string
          description: string | null
          date: string
          start_time: string | null
          end_time: string | null
          location: string | null
          category: ItineraryCategory
          order_index: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          description?: string | null
          date: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          category?: ItineraryCategory
          order_index?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          category?: ItineraryCategory
          order_index?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      travel_documents: {
        Row: {
          id: string
          group_id: string
          title: string
          file_url: string
          file_name: string | null
          file_size: number | null
          document_type: DocumentType
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          file_url: string
          file_name?: string | null
          file_size?: number | null
          document_type?: DocumentType
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          document_type?: DocumentType
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          group_id: string
          file_url: string
          thumbnail_url: string | null
          caption: string | null
          taken_at: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          group_id: string
          file_url: string
          thumbnail_url?: string | null
          caption?: string | null
          taken_at?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          file_url?: string
          thumbnail_url?: string | null
          caption?: string | null
          taken_at?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      photo_comments: {
        Row: {
          id: string
          photo_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          photo_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          photo_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          group_id: string
          description: string
          amount: number
          currency: string
          category: ExpenseCategory
          paid_by: string | null
          split_type: ExpenseSplitType
          receipt_url: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          description: string
          amount: number
          currency?: string
          category?: ExpenseCategory
          paid_by?: string | null
          split_type?: ExpenseSplitType
          receipt_url?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          description?: string
          amount?: number
          currency?: string
          category?: ExpenseCategory
          paid_by?: string | null
          split_type?: ExpenseSplitType
          receipt_url?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount_owed: number
          percentage: number | null
          is_settled: boolean
          settled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount_owed: number
          percentage?: number | null
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount_owed?: number
          percentage?: number | null
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
      }
      group_notes: {
        Row: {
          id: string
          group_id: string
          title: string
          content: string | null
          last_edited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title?: string
          content?: string | null
          last_edited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          content?: string | null
          last_edited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type TravelGroup = Database['public']['Tables']['travel_groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type ItineraryItem = Database['public']['Tables']['itinerary_items']['Row']
export type TravelDocument = Database['public']['Tables']['travel_documents']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type PhotoComment = Database['public']['Tables']['photo_comments']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row']
export type GroupNote = Database['public']['Tables']['group_notes']['Row']

// Extended types with relations
export type GroupWithMembers = TravelGroup & {
  group_members: (GroupMember & {
    users: User
  })[]
}

export type ExpenseWithSplits = Expense & {
  expense_splits: (ExpenseSplit & {
    users: User
  })[]
  paid_by_user: User | null
}

export type PhotoWithComments = Photo & {
  photo_comments: (PhotoComment & {
    users: User
  })[]
  uploaded_by_user: User | null
}
