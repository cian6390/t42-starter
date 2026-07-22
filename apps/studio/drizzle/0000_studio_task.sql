CREATE SCHEMA IF NOT EXISTS "studio";
--> statement-breakpoint
CREATE TABLE "studio"."task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'backlog' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "studio"."task" ADD CONSTRAINT "task_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."user"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "task_status_position_idx" ON "studio"."task" USING btree ("status","position");
--> statement-breakpoint
CREATE INDEX "task_deleted_at_idx" ON "studio"."task" USING btree ("deleted_at");
