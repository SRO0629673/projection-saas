export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        { id: string; email: string | null; full_name: string; profession: string; mobile: string | null; created_at: string; updated_at: string },
        { id: string; email?: string | null; full_name?: string; profession?: string; mobile?: string | null; created_at?: string; updated_at?: string },
        { email?: string | null; full_name?: string; profession?: string; mobile?: string | null; updated_at?: string }
      >;
      projection_reports: Table<
        { id: string; user_id: string; business_name: string; sector: string; status: "draft" | "completed"; input: Json; result: Json; created_at: string; updated_at: string },
        { id?: string; user_id: string; business_name: string; sector: string; status?: "draft" | "completed"; input: Json; result: Json; created_at?: string; updated_at?: string },
        { business_name?: string; sector?: string; status?: "draft" | "completed"; input?: Json; result?: Json; updated_at?: string }
      >;
      payment_transactions: Table<
        { id: string; user_id: string; plan_id: string; amount_paise: number; currency: string; razorpay_order_id: string; razorpay_payment_id: string | null; status: "created" | "captured" | "failed" | "refunded"; created_at: string; captured_at: string | null },
        { id?: string; user_id: string; plan_id: string; amount_paise: number; currency?: string; razorpay_order_id: string; razorpay_payment_id?: string | null; status?: "created" | "captured" | "failed" | "refunded"; created_at?: string; captured_at?: string | null },
        { razorpay_payment_id?: string | null; status?: "created" | "captured" | "failed" | "refunded"; captured_at?: string | null }
      >;
      subscriptions: Table<
        { id: string; user_id: string; plan_id: string; payment_transaction_id: string; starts_at: string; ends_at: string; created_at: string },
        { id?: string; user_id: string; plan_id: string; payment_transaction_id: string; starts_at: string; ends_at: string; created_at?: string },
        { plan_id?: string; starts_at?: string; ends_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      activate_subscription_for_payment: {
        Args: { p_razorpay_order_id: string; p_razorpay_payment_id: string; p_captured_at?: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};