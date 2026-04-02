-- Migration: add background color fields to slides
USE TanaCargo;
GO

ALTER TABLE [dbo].[slides]
ADD
    [bg_color_start] [nvarchar](50) NULL,
    [bg_color_end] [nvarchar](50) NULL,
    [bg_type] [nvarchar](20) NULL
ON [PRIMARY]
GO

-- Default bg_type to 'solid' when not provided
UPDATE [dbo].[slides] SET bg_type = 'solid' WHERE bg_type IS NULL;
GO

PRINT 'Migration 20260403_add_slide_colors completed.';
GO