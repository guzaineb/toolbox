-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'expert', 'project_owner', 'incubator_membre');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('admin', 'program_manager', 'cohort_manager', 'review_manager', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "IncubatorStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "FundingPhase" AS ENUM ('IDEATION', 'VALIDATION', 'EARLY_STAGE', 'GROWTH', 'SCALING');

-- CreateEnum
CREATE TYPE "ImpactPeriod" AS ENUM ('MENSUEL', 'TRIMESTRIEL', 'ANNUEL');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_GENERATED', 'GENERATED', 'UPDATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verification_code" TEXT,
    "verification_code_expires" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "UserRole",
    "profile_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "birth_date" TIMESTAMP(3),
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "bio" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'fr',
    "linkedin" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expertise_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "expertise_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_profiles" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT,
    "organization" TEXT,
    "position" TEXT,
    "years_of_experience" INTEGER,
    "linkedin_url" TEXT,
    "availability_status" TEXT NOT NULL DEFAULT 'available',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "expert_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_profile_expertise_areas" (
    "id" TEXT NOT NULL,
    "level" TEXT,
    "years_of_experience" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expert_profile_id" TEXT NOT NULL,
    "expertise_area_id" TEXT NOT NULL,

    CONSTRAINT "expert_profile_expertise_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "foundation_date" TIMESTAMP(3),
    "organization_type" TEXT,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website_url" TEXT,
    "address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "logo_url" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "status" "IncubatorStatus" NOT NULL DEFAULT 'active',
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incubators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubator_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "incubator_id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "job_title" TEXT,
    "department" TEXT,
    "bio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_programs" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_cohorts" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_members" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "incubator_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubator_invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "incubator_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "job_title" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incubator_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubator_documents" (
    "id" TEXT NOT NULL,
    "incubator_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "uploaded_by_user_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incubator_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_owner_profiles" (
    "id" TEXT NOT NULL,
    "current_status" TEXT,
    "education_level" TEXT,
    "field_of_study" TEXT,
    "occupation" TEXT,
    "linkedin_url" TEXT,
    "entrepreneurial_experience_level" INTEGER NOT NULL DEFAULT 0,
    "has_previous_startup" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_owner_skills" (
    "id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "level" TEXT,
    "project_owner_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_owner_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_owner_experiences" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TEXT,
    "end_date" TEXT,
    "project_owner_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_owner_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "gbm_reviewed_at" TIMESTAMP(3),
    "is_gbm_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_progress" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program" TEXT,
    "description" TEXT,
    "capacity" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "CohortStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_participations" (
    "id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invited_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "step_key" TEXT,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokens_used" INTEGER,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_sketches" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "idea_initial" TEXT,
    "product_service" TEXT,
    "customers" TEXT,
    "partners" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idea_sketches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems_needs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "environmental_challenges" TEXT,
    "social_challenges" TEXT,
    "customer_needs" TEXT,
    "team_motivations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pestels" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "political_what" TEXT,
    "political_how" TEXT,
    "economic_what" TEXT,
    "economic_how" TEXT,
    "social_what" TEXT,
    "social_how" TEXT,
    "technological_what" TEXT,
    "technological_how" TEXT,
    "environmental_what" TEXT,
    "environmental_how" TEXT,
    "legal_what" TEXT,
    "legal_how" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pestels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "environmental_problems" TEXT,
    "environmental_objectives" TEXT,
    "social_problems" TEXT,
    "social_objectives" TEXT,
    "customer_problems" TEXT,
    "customer_objectives" TEXT,
    "team_problems" TEXT,
    "team_objectives" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_visions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_visions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_summaries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "summary_text" TEXT,
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "context_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholders" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "interest" TEXT,
    "influence" TEXT,
    "engagement_strategy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder_maps" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "stakeholder_name" TEXT,
    "contribution" TEXT,
    "reward" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_segments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "segment_name" TEXT,
    "description" TEXT,
    "pains" TEXT,
    "gains" TEXT,
    "functions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_propositions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "environmental_value" TEXT,
    "social_value" TEXT,
    "pain_relievers" TEXT,
    "gain_creators" TEXT,
    "products_services" TEXT,
    "value_added" TEXT,
    "innovation_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_propositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_discoveries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "hypothesis" TEXT,
    "test_method" TEXT,
    "results" TEXT,
    "learnings" TEXT,
    "validated" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_proposition_pivots" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "initial_assumptions" TEXT,
    "test_results" TEXT,
    "pivot_decision" TEXT,
    "new_value_proposition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_proposition_pivots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_relations_channels" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "customer_relationships" TEXT,
    "channels" TEXT,
    "distribution_strategy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_relations_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_journeys" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "stage_name" TEXT,
    "touchpoints" TEXT,
    "customer_emotions" TEXT,
    "improvement_ideas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_activities_resources" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "key_activities" TEXT,
    "key_resources" TEXT,
    "strategic_partners" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_activities_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eco_designs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "equipe_eco" TEXT,
    "projet_eco" TEXT,
    "contexte_eco" TEXT,
    "vision_durable" TEXT,
    "cycle_de_vie" JSONB,
    "performance_eco" TEXT,
    "strategies_eco" JSONB,
    "plan_action_eco" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eco_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eco_design_results" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "eco_results" TEXT,
    "performance_analysis" TEXT,
    "improvements" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eco_design_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_activities" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "activities_summary" TEXT,
    "key_achievements" TEXT,
    "next_steps" TEXT,
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summary_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_structures" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "fixed_costs" TEXT,
    "variable_costs" TEXT,
    "cost_drivers" TEXT,
    "breakeven_analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_streams" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "revenue_sources" TEXT,
    "pricing_strategy" TEXT,
    "revenue_projections" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_revenue_summaries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "cost_summary" TEXT,
    "revenue_summary" TEXT,
    "financial_health" TEXT,
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_revenue_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_preparations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "test_objectives" TEXT,
    "test_method" TEXT,
    "success_criteria" TEXT,
    "resources_needed" TEXT,
    "timeline" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_preparations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "environmental_kpis" TEXT,
    "social_kpis" TEXT,
    "economic_kpis" TEXT,
    "measurement_method" TEXT,
    "review_frequency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_plans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "problemes_gestion" TEXT,
    "ressources_humaines" TEXT,
    "actifs_physiques" TEXT,
    "ressources_intellectuelles" TEXT,
    "production_fournisseurs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_plans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "clients_valeur" TEXT,
    "analyse_marche" TEXT,
    "concurrents" TEXT,
    "offre_prix" TEXT,
    "branding_positionnement" TEXT,
    "canaux_communication" TEXT,
    "relation_client" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "point_depart" TEXT,
    "couts_configuration" DOUBLE PRECISION,
    "capital" DOUBLE PRECISION,
    "compte_resultat" JSONB,
    "cash_flow" JSONB,
    "bilan" JSONB,
    "seuil_rentabilite" DOUBLE PRECISION,
    "revenus_3ans" JSONB,
    "autres_mesures" TEXT,
    "rapport_financier" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_plans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "statut_juridique" TEXT,
    "immatriculation" TEXT,
    "contrats" TEXT,
    "assurances" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpis" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "kpis" JSONB,
    "objectifs_mesure" TEXT,
    "revues_performance" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_summaries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "resume_executif" TEXT,
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_assessments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reponses_questionnaire" JSONB,
    "score_maturite" INTEGER,
    "phase_maturite" "FundingPhase",
    "opportunites_financement" JSONB,
    "opportunites_pays" TEXT,
    "strategie_levee_fonds" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_accesses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "essence_marque" TEXT,
    "alignement_objectifs" TEXT,
    "positionnement" TEXT,
    "identite_visuelle" TEXT,
    "narration" TEXT,
    "messages_cles" JSONB,
    "canaux_marketing" JSONB,
    "partenariats_market" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_measures" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "kpis_environnementaux" JSONB,
    "kpis_sociaux" JSONB,
    "kpis_economiques" JSONB,
    "methode_mesure" TEXT,
    "periode_mesure" "ImpactPeriod",
    "objectifs_impact" JSONB,
    "resultats_actuels" JSONB,
    "rapport_impact" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swot_analyses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "opportunities" TEXT,
    "threats" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swot_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "document_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'NOT_GENERATED',
    "content" TEXT,
    "generated_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "expert_profiles_user_id_key" ON "expert_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "expert_profile_expertise_areas_expert_profile_id_expertise__key" ON "expert_profile_expertise_areas"("expert_profile_id", "expertise_area_id");

-- CreateIndex
CREATE UNIQUE INDEX "incubators_slug_key" ON "incubators"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "incubator_members_user_id_incubator_id_key" ON "incubator_members"("user_id", "incubator_id");

-- CreateIndex
CREATE UNIQUE INDEX "incubator_invitations_token_key" ON "incubator_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "project_owner_profiles_user_id_key" ON "project_owner_profiles"("user_id");

-- CreateIndex
CREATE INDEX "projects_name_idx" ON "projects"("name");

-- CreateIndex
CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");

-- CreateIndex
CREATE INDEX "step_progress_project_id_idx" ON "step_progress"("project_id");

-- CreateIndex
CREATE INDEX "step_progress_step_key_idx" ON "step_progress"("step_key");

-- CreateIndex
CREATE INDEX "step_progress_status_idx" ON "step_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "step_progress_project_id_step_key_key" ON "step_progress"("project_id", "step_key");

-- CreateIndex
CREATE INDEX "cohorts_status_idx" ON "cohorts"("status");

-- CreateIndex
CREATE INDEX "cohort_participations_cohort_id_idx" ON "cohort_participations"("cohort_id");

-- CreateIndex
CREATE INDEX "cohort_participations_project_id_idx" ON "cohort_participations"("project_id");

-- CreateIndex
CREATE INDEX "cohort_participations_status_idx" ON "cohort_participations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_participations_cohort_id_project_id_key" ON "cohort_participations"("cohort_id", "project_id");

-- CreateIndex
CREATE INDEX "ai_interactions_project_id_idx" ON "ai_interactions"("project_id");

-- CreateIndex
CREATE INDEX "ai_interactions_step_key_idx" ON "ai_interactions"("step_key");

-- CreateIndex
CREATE UNIQUE INDEX "idea_sketches_project_id_key" ON "idea_sketches"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "problems_needs_project_id_key" ON "problems_needs"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "pestels_project_id_key" ON "pestels"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "objectives_project_id_key" ON "objectives"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_visions_project_id_key" ON "mission_visions"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "context_summaries_project_id_key" ON "context_summaries"("project_id");

-- CreateIndex
CREATE INDEX "stakeholders_project_id_idx" ON "stakeholders"("project_id");

-- CreateIndex
CREATE INDEX "stakeholder_maps_project_id_idx" ON "stakeholder_maps"("project_id");

-- CreateIndex
CREATE INDEX "customer_segments_project_id_idx" ON "customer_segments"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "value_propositions_project_id_key" ON "value_propositions"("project_id");

-- CreateIndex
CREATE INDEX "test_discoveries_project_id_idx" ON "test_discoveries"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "value_proposition_pivots_project_id_key" ON "value_proposition_pivots"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_relations_channels_project_id_key" ON "customer_relations_channels"("project_id");

-- CreateIndex
CREATE INDEX "customer_journeys_project_id_idx" ON "customer_journeys"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "key_activities_resources_project_id_key" ON "key_activities_resources"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "eco_designs_project_id_key" ON "eco_designs"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "eco_design_results_project_id_key" ON "eco_design_results"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "summary_activities_project_id_key" ON "summary_activities"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_structures_project_id_key" ON "cost_structures"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_streams_project_id_key" ON "revenue_streams"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_revenue_summaries_project_id_key" ON "cost_revenue_summaries"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_preparations_project_id_key" ON "test_preparations"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_project_id_key" ON "indicators"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "management_plans_project_id_key" ON "management_plans"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_plans_project_id_key" ON "marketing_plans"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_plans_project_id_key" ON "financial_plans"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_plans_project_id_key" ON "legal_plans"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpis_project_id_key" ON "kpis"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "executive_summaries_project_id_key" ON "executive_summaries"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "funding_assessments_project_id_key" ON "funding_assessments"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "market_accesses_project_id_key" ON "market_accesses"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "impact_measures_project_id_key" ON "impact_measures"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "swot_analyses_project_id_key" ON "swot_analyses"("project_id");

-- CreateIndex
CREATE INDEX "generated_documents_project_id_idx" ON "generated_documents"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_project_id_document_key_key" ON "generated_documents"("project_id", "document_key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_profiles" ADD CONSTRAINT "expert_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_profile_expertise_areas" ADD CONSTRAINT "expert_profile_expertise_areas_expert_profile_id_fkey" FOREIGN KEY ("expert_profile_id") REFERENCES "expert_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_profile_expertise_areas" ADD CONSTRAINT "expert_profile_expertise_areas_expertise_area_id_fkey" FOREIGN KEY ("expertise_area_id") REFERENCES "expertise_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_members" ADD CONSTRAINT "incubator_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_members" ADD CONSTRAINT "incubator_members_incubator_id_fkey" FOREIGN KEY ("incubator_id") REFERENCES "incubators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_invitations" ADD CONSTRAINT "incubator_invitations_incubator_id_fkey" FOREIGN KEY ("incubator_id") REFERENCES "incubators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_documents" ADD CONSTRAINT "incubator_documents_incubator_id_fkey" FOREIGN KEY ("incubator_id") REFERENCES "incubators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_documents" ADD CONSTRAINT "incubator_documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_owner_profiles" ADD CONSTRAINT "project_owner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_owner_skills" ADD CONSTRAINT "project_owner_skills_project_owner_profile_id_fkey" FOREIGN KEY ("project_owner_profile_id") REFERENCES "project_owner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_owner_experiences" ADD CONSTRAINT "project_owner_experiences_project_owner_profile_id_fkey" FOREIGN KEY ("project_owner_profile_id") REFERENCES "project_owner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_participations" ADD CONSTRAINT "cohort_participations_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_participations" ADD CONSTRAINT "cohort_participations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_sketches" ADD CONSTRAINT "idea_sketches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems_needs" ADD CONSTRAINT "problems_needs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pestels" ADD CONSTRAINT "pestels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_visions" ADD CONSTRAINT "mission_visions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_summaries" ADD CONSTRAINT "context_summaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_maps" ADD CONSTRAINT "stakeholder_maps_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_propositions" ADD CONSTRAINT "value_propositions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_discoveries" ADD CONSTRAINT "test_discoveries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_proposition_pivots" ADD CONSTRAINT "value_proposition_pivots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_relations_channels" ADD CONSTRAINT "customer_relations_channels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_journeys" ADD CONSTRAINT "customer_journeys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_activities_resources" ADD CONSTRAINT "key_activities_resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eco_designs" ADD CONSTRAINT "eco_designs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eco_design_results" ADD CONSTRAINT "eco_design_results_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary_activities" ADD CONSTRAINT "summary_activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_structures" ADD CONSTRAINT "cost_structures_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_streams" ADD CONSTRAINT "revenue_streams_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_revenue_summaries" ADD CONSTRAINT "cost_revenue_summaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_preparations" ADD CONSTRAINT "test_preparations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_plans" ADD CONSTRAINT "management_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_plans" ADD CONSTRAINT "marketing_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_plans" ADD CONSTRAINT "financial_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_plans" ADD CONSTRAINT "legal_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_summaries" ADD CONSTRAINT "executive_summaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_assessments" ADD CONSTRAINT "funding_assessments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_accesses" ADD CONSTRAINT "market_accesses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_measures" ADD CONSTRAINT "impact_measures_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swot_analyses" ADD CONSTRAINT "swot_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

