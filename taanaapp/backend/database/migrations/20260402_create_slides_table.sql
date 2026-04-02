-- Migration: create slides table
USE TanaCargo;
GO

CREATE TABLE [dbo].[slides](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [title] [nvarchar](255) NULL,
    [subtitle] [nvarchar](max) NULL,
    [image_url] [nvarchar](500) NULL,
    [cta_text] [nvarchar](100) NULL,
    [cta_link] [nvarchar](500) NULL,
    [slide_order] [int] NULL,
    [is_active] [bit] NULL,
    [animation_type] [nvarchar](50) NULL,
    [created_at] [datetime2](7) NULL,
    [updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [id] ASC
)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[slides] ADD  DEFAULT ((1)) FOR [is_active]
GO

ALTER TABLE [dbo].[slides] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO

ALTER TABLE [dbo].[slides] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO

PRINT 'Migration 20260402_create_slides_table completed.';
GO
