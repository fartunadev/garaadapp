-- Migration: create sellers table (int IDs)
USE TanaCargo;
GO

CREATE TABLE [dbo].[sellers](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_id] [int] NOT NULL,
    [store_name] [nvarchar](255) NOT NULL,
    [store_description] [nvarchar](max) NULL,
    [logo_url] [nvarchar](200) NULL,
    [banner_url] [nvarchar](200) NULL,
    [email] [nvarchar](255) NULL,
    [phone] [nvarchar](50) NULL,
    [address] [nvarchar](200) NULL,
    [city] [nvarchar](100) NULL,
    [country] [nvarchar](100) NULL,
    [commission_rate] [decimal](5, 2) NULL,
    [rating] [decimal](3, 2) NULL,
    [total_products] [int] NULL,
    [total_sales] [decimal](18, 2) NULL,
    [is_verified] [bit] NULL,
    [is_active] [bit] NULL,
    [created_at] [datetime2](7) NULL,
    [updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [id] ASC
)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT ((10.00)) FOR [commission_rate]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT ((0)) FOR [total_products]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT ((0)) FOR [total_sales]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT ((0)) FOR [is_verified]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT ((0)) FOR [is_active]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO

ALTER TABLE [dbo].[sellers] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO

PRINT 'Migration 20260326_create_sellers_table completed.';
GO
