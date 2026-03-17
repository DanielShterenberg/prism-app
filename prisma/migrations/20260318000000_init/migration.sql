-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);
