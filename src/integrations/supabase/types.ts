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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          etablissement_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          etablissement_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          etablissement_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          date_naissance: string
          email: string
          etablissement_id: string
          id: string
          nom_complet: string
          statut: string
          telephone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_naissance: string
          email: string
          etablissement_id: string
          id?: string
          nom_complet: string
          statut?: string
          telephone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_naissance?: string
          email?: string
          etablissement_id?: string
          id?: string
          nom_complet?: string
          statut?: string
          telephone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
      annonces: {
        Row: {
          auteur: string | null
          contenu: string
          created_at: string
          etablissement_id: string
          filiere_id: string | null
          id: string
          niveau_id: string | null
          tag: string | null
          titre: string
          urgent: boolean | null
        }
        Insert: {
          auteur?: string | null
          contenu: string
          created_at?: string
          etablissement_id: string
          filiere_id?: string | null
          id?: string
          niveau_id?: string | null
          tag?: string | null
          titre: string
          urgent?: boolean | null
        }
        Update: {
          auteur?: string | null
          contenu?: string
          created_at?: string
          etablissement_id?: string
          filiere_id?: string | null
          id?: string
          niveau_id?: string | null
          tag?: string | null
          titre?: string
          urgent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "annonces_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annonces_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annonces_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annonces_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      cours_achats: {
        Row: {
          cours_id: string
          created_at: string
          etudiant_id: string
          id: string
          methode_paiement: string | null
          montant: number
          statut: string
        }
        Insert: {
          cours_id: string
          created_at?: string
          etudiant_id: string
          id?: string
          methode_paiement?: string | null
          montant?: number
          statut?: string
        }
        Update: {
          cours_id?: string
          created_at?: string
          etudiant_id?: string
          id?: string
          methode_paiement?: string | null
          montant?: number
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "cours_achats_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours_en_ligne"
            referencedColumns: ["id"]
          },
        ]
      }
      cours_en_ligne: {
        Row: {
          created_at: string
          description: string | null
          id: string
          matiere: string
          niveau: string | null
          prix: number
          professeur_id: string
          statut: string
          titre: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          matiere: string
          niveau?: string | null
          prix?: number
          professeur_id: string
          statut?: string
          titre: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          matiere?: string
          niveau?: string | null
          prix?: number
          professeur_id?: string
          statut?: string
          titre?: string
          video_url?: string | null
        }
        Relationships: []
      }
      demandes_partenariat: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          nom_etablissement: string
          responsable: string
          statut: string | null
          telephone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          nom_etablissement: string
          responsable: string
          statut?: string | null
          telephone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          nom_etablissement?: string
          responsable?: string
          statut?: string | null
          telephone?: string | null
        }
        Relationships: []
      }
      demandes_professeur: {
        Row: {
          created_at: string
          email: string
          etablissement_origine: string | null
          experience: string | null
          id: string
          matiere: string
          nom_complet: string
          statut: string
        }
        Insert: {
          created_at?: string
          email: string
          etablissement_origine?: string | null
          experience?: string | null
          id?: string
          matiere: string
          nom_complet: string
          statut?: string
        }
        Update: {
          created_at?: string
          email?: string
          etablissement_origine?: string | null
          experience?: string | null
          id?: string
          matiere?: string
          nom_complet?: string
          statut?: string
        }
        Relationships: []
      }
      emplois_du_temps: {
        Row: {
          created_at: string
          enseignant: string | null
          etablissement_id: string
          filiere_id: string | null
          heure_debut: string | null
          heure_fin: string | null
          id: string
          jour: string
          matiere: string
          niveau_id: string | null
          salle: string | null
        }
        Insert: {
          created_at?: string
          enseignant?: string | null
          etablissement_id: string
          filiere_id?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour: string
          matiere: string
          niveau_id?: string | null
          salle?: string | null
        }
        Update: {
          created_at?: string
          enseignant?: string | null
          etablissement_id?: string
          filiere_id?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour?: string
          matiere?: string
          niveau_id?: string | null
          salle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emplois_du_temps_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emplois_du_temps_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emplois_du_temps_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emplois_du_temps_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      etablissements: {
        Row: {
          adresse: string | null
          categorie:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          nom: string
          pays: string
          statut: Database["public"]["Enums"]["etablissement_statut"]
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          categorie?:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          pays?: string
          statut?: Database["public"]["Enums"]["etablissement_statut"]
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          categorie?:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          pays?: string
          statut?: Database["public"]["Enums"]["etablissement_statut"]
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      etudiants: {
        Row: {
          created_at: string
          date_naissance: string | null
          email: string | null
          etablissement_id: string
          filiere_id: string | null
          id: string
          matricule: string | null
          niveau_id: string | null
          nom_complet: string
          statut: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id: string
          filiere_id?: string | null
          id?: string
          matricule?: string | null
          niveau_id?: string | null
          nom_complet: string
          statut?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id?: string
          filiere_id?: string | null
          id?: string
          matricule?: string | null
          niveau_id?: string | null
          nom_complet?: string
          statut?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etudiants_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etudiants_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etudiants_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etudiants_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      evenements: {
        Row: {
          categorie: string | null
          created_at: string
          date_evt: string | null
          description: string | null
          etablissement_id: string
          id: string
          image_url: string | null
          lieu: string | null
          titre: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          date_evt?: string | null
          description?: string | null
          etablissement_id: string
          id?: string
          image_url?: string | null
          lieu?: string | null
          titre: string
        }
        Update: {
          categorie?: string | null
          created_at?: string
          date_evt?: string | null
          description?: string | null
          etablissement_id?: string
          id?: string
          image_url?: string | null
          lieu?: string | null
          titre?: string
        }
        Relationships: [
          {
            foreignKeyName: "evenements_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
      filieres: {
        Row: {
          created_at: string
          etablissement_id: string
          id: string
          nom: string
        }
        Insert: {
          created_at?: string
          etablissement_id: string
          id?: string
          nom: string
        }
        Update: {
          created_at?: string
          etablissement_id?: string
          id?: string
          nom?: string
        }
        Relationships: [
          {
            foreignKeyName: "filieres_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filieres_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
      liste_officielle: {
        Row: {
          created_at: string
          date_naissance: string | null
          email: string | null
          etablissement_id: string
          filiere_id: string | null
          id: string
          matricule: string | null
          niveau_id: string | null
          nom_complet: string
          utilise: boolean | null
        }
        Insert: {
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id: string
          filiere_id?: string | null
          id?: string
          matricule?: string | null
          niveau_id?: string | null
          nom_complet: string
          utilise?: boolean | null
        }
        Update: {
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id?: string
          filiere_id?: string | null
          id?: string
          matricule?: string | null
          niveau_id?: string | null
          nom_complet?: string
          utilise?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "liste_officielle_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liste_officielle_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liste_officielle_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liste_officielle_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      matieres: {
        Row: {
          code: string | null
          created_at: string
          credit: number | null
          etablissement_id: string
          filiere_id: string | null
          id: string
          niveau_id: string | null
          nom: string
          semestre: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          credit?: number | null
          etablissement_id: string
          filiere_id?: string | null
          id?: string
          niveau_id?: string | null
          nom: string
          semestre?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          credit?: number | null
          etablissement_id?: string
          filiere_id?: string | null
          id?: string
          niveau_id?: string | null
          nom?: string
          semestre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matieres_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matieres_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matieres_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matieres_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      niveaux: {
        Row: {
          created_at: string
          etablissement_id: string
          filiere_id: string | null
          id: string
          nom: string
          ordre: number | null
        }
        Insert: {
          created_at?: string
          etablissement_id: string
          filiere_id?: string | null
          id?: string
          nom: string
          ordre?: number | null
        }
        Update: {
          created_at?: string
          etablissement_id?: string
          filiere_id?: string | null
          id?: string
          nom?: string
          ordre?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "niveaux_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niveaux_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niveaux_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          created_at: string
          etudiant_id: string
          id: string
          matiere_id: string
          note: number | null
          published: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          etudiant_id: string
          id?: string
          matiere_id: string
          note?: number | null
          published?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          etudiant_id?: string
          id?: string
          matiere_id?: string
          note?: number | null
          published?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lu: boolean | null
          message: string | null
          titre: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lu?: boolean | null
          message?: string | null
          titre: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lu?: boolean | null
          message?: string | null
          titre?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parametres_plateforme: {
        Row: {
          commission_percentage: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_naissance: string | null
          email: string | null
          etablissement_id: string | null
          id: string
          nom_complet: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id?: string | null
          id: string
          nom_complet?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          etablissement_id?: string | null
          id?: string
          nom_complet?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          date_naissance: string
          email: string
          id: string
          nom_complet: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_naissance: string
          email: string
          id?: string
          nom_complet: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_naissance?: string
          email?: string
          id?: string
          nom_complet?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          etablissement_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          etablissement_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          etablissement_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      etablissements_public: {
        Row: {
          categorie:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          description: string | null
          id: string | null
          logo_url: string | null
          nom: string | null
          pays: string | null
          statut: Database["public"]["Enums"]["etablissement_statut"] | null
          ville: string | null
        }
        Insert: {
          categorie?:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          nom?: string | null
          pays?: string | null
          statut?: Database["public"]["Enums"]["etablissement_statut"] | null
          ville?: string | null
        }
        Update: {
          categorie?:
            | Database["public"]["Enums"]["etablissement_categorie"]
            | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          nom?: string | null
          pays?: string | null
          statut?: Database["public"]["Enums"]["etablissement_statut"] | null
          ville?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_etablissement_id: { Args: never; Returns: string }
      email_role: { Args: { _email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_of: {
        Args: { _etablissement_id: string; _user_id: string }
        Returns: boolean
      }
      lookup_user_by_email_birthdate: {
        Args: { _date_naissance: string; _email: string }
        Returns: {
          etablissement_id: string
          filiere_id: string
          niveau_id: string
          nom_complet: string
          role: string
        }[]
      }
      verify_student_identity: {
        Args: {
          _date_naissance: string
          _etablissement_id: string
          _filiere_id: string
          _niveau_id: string
          _nom_complet: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin_etablissement" | "etudiant"
      etablissement_categorie: "publique" | "privee"
      etablissement_statut: "actif" | "suspendu" | "en_attente"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin_etablissement", "etudiant"],
      etablissement_categorie: ["publique", "privee"],
      etablissement_statut: ["actif", "suspendu", "en_attente"],
    },
  },
} as const
