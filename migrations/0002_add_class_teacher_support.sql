-- Add support for class teacher information in teacher_mappings table
-- The isClassTeacher field is stored within the JSON divisions column
-- This migration ensures existing data is compatible

-- No schema changes needed as isClassTeacher is stored in the JSON divisions column
-- Existing data will have isClassTeacher as undefined/null, which is handled by the application
-- New data will include isClassTeacher: boolean in the divisions JSON structure

-- Example of the new divisions JSON structure:
-- [{"division": "A", "teacherId": 16, "teacherName": "Ms. Karen Rodriguez", "isClassTeacher": true}]
