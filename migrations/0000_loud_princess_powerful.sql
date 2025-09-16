CREATE TABLE "bus_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_number" text NOT NULL,
	"route_name" text NOT NULL,
	"from_location" text NOT NULL,
	"to_location" text NOT NULL,
	"bus_number" text NOT NULL,
	"stops" json DEFAULT '[]'::json,
	"vehicle_number" text NOT NULL,
	"driver_name" text NOT NULL,
	"driver_contact_number" text NOT NULL,
	"bus_attender_name" text NOT NULL,
	"bus_attender_contact_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"class" text NOT NULL,
	"division" text NOT NULL,
	"subjects" text[] NOT NULL,
	"elective_groups" json DEFAULT '[]'::json NOT NULL,
	"status" text DEFAULT 'Current working' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"from_date" text NOT NULL,
	"to_date" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hand_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_name" text NOT NULL,
	"description" text,
	"mock_start_date" text NOT NULL,
	"mock_end_date" text NOT NULL,
	"class" text[] NOT NULL,
	"division" text[] NOT NULL,
	"subjects" text[] NOT NULL,
	"has_file_upload" boolean DEFAULT false NOT NULL,
	"file_name" text,
	"file_path" text,
	"file_size" integer,
	"questions" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_circulars" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"title" text,
	"description" text,
	"text" text,
	"from_date" text NOT NULL,
	"to_date" text NOT NULL,
	"file_name" text,
	"file_path" text,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"topic_name" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "periodic_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"test_name" text NOT NULL,
	"class" text NOT NULL,
	"subject" text NOT NULL,
	"subject_type" text DEFAULT 'core' NOT NULL,
	"group_elective_name" text,
	"chapters" text[] NOT NULL,
	"test_date" text NOT NULL,
	"test_end_date" text NOT NULL,
	"from_time" text NOT NULL,
	"to_time" text NOT NULL,
	"duration" text NOT NULL,
	"maximum_marks" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photo_galleries" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" text NOT NULL,
	"description" text,
	"image_count" integer DEFAULT 0 NOT NULL,
	"image_paths" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_name" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"poll_type" text,
	"questions" json DEFAULT '[]'::json,
	"choices" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"holiday_description" text NOT NULL,
	"holiday_type" text NOT NULL,
	"from_date" text NOT NULL,
	"to_date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"timing_from" text NOT NULL,
	"timing_to" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"staff_id" text NOT NULL,
	"role" text NOT NULL,
	"new_role" text,
	"mobile_number" text NOT NULL,
	"email" text NOT NULL,
	"manager_name" text,
	"status" text NOT NULL,
	"last_working_day" text,
	CONSTRAINT "staff_staff_id_unique" UNIQUE("staff_id"),
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text,
	"sex" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"flat_building_no" text NOT NULL,
	"area_locality" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" text NOT NULL,
	"landmark" text,
	"contact_number" text,
	"email_id" text,
	"class" text NOT NULL,
	"division" text NOT NULL,
	"roll_number" integer NOT NULL,
	"selected_elective_groups" json DEFAULT '[]'::json,
	"father_name" text,
	"father_mobile_number" text,
	"father_email_id" text,
	"mother_name" text,
	"mother_mobile_number" text,
	"mother_email_id" text,
	"guardian_name" text,
	"guardian_mobile_number" text,
	"guardian_email_id" text,
	"guardian_relation" text,
	"apaar_id" text NOT NULL,
	"aadhar_number" text NOT NULL,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_name" text NOT NULL,
	"subject_type" text DEFAULT 'core' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "subjects_subject_name_unique" UNIQUE("subject_name")
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_name" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"survey_type" text,
	"questions" json DEFAULT '[]'::json,
	"choices" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syllabus_masters" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"subject" text NOT NULL,
	"subject_type" text DEFAULT 'core' NOT NULL,
	"class" text NOT NULL,
	"divisions" text[] NOT NULL,
	"chapter_lesson_no" text NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"class" text NOT NULL,
	"subject" text NOT NULL,
	"divisions" json NOT NULL,
	"status" text DEFAULT 'Current working' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"periodic_test_id" integer NOT NULL,
	"periodic_test_name" text NOT NULL,
	"class" text NOT NULL,
	"division" text NOT NULL,
	"subject" text NOT NULL,
	"subject_type" text DEFAULT 'core' NOT NULL,
	"student_id" integer NOT NULL,
	"student_name" text NOT NULL,
	"roll_number" integer NOT NULL,
	"marks" integer,
	"max_marks" integer DEFAULT 100 NOT NULL,
	"grade" text,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_table_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_table_id" integer NOT NULL,
	"day_of_week" text NOT NULL,
	"schedule_slot" text NOT NULL,
	"subject_id" integer,
	"teacher_id" integer,
	"elective_group_name" text,
	"subject_ids" text,
	"teacher_ids" text
);
--> statement-breakpoint
CREATE TABLE "time_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"academic_year" text NOT NULL,
	"class_name" text NOT NULL,
	"division" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "working_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" text NOT NULL,
	"day_type" text NOT NULL,
	"alternate_weeks" text[],
	"timing_from" text,
	"timing_to" text
);
--> statement-breakpoint
ALTER TABLE "time_table_entries" ADD CONSTRAINT "time_table_entries_time_table_id_time_tables_id_fk" FOREIGN KEY ("time_table_id") REFERENCES "public"."time_tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_table_entries" ADD CONSTRAINT "time_table_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_table_entries" ADD CONSTRAINT "time_table_entries_teacher_id_staff_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;