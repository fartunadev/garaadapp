USE [Taano]
GO
/****** Object:  Table [dbo].[addresses]    Script Date: 3/30/2026 4:45:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[addresses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[full_name] [nvarchar](255) NULL,
	[phone] [nvarchar](50) NULL,
	[address_line1] [nvarchar](255) NOT NULL,
	[address_line2] [nvarchar](255) NULL,
	[city] [nvarchar](100) NOT NULL,
	[state] [nvarchar](100) NULL,
	[postal_code] [nvarchar](20) NULL,
	[country] [nvarchar](100) NOT NULL,
	[label] [nvarchar](20) NULL,
	[is_default] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[categories]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[slug] [nvarchar](100) NOT NULL,
	[image_url] [nvarchar](200) NULL,
	[sort_order] [int] NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[marketing_campaigns]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[marketing_campaigns](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[type] [nvarchar](50) NOT NULL,
	[discount_code] [nvarchar](50) NULL,
	[discount_percent] [decimal](5, 2) NULL,
	[budget] [decimal](18, 2) NULL,
	[target_audience] [nvarchar](100) NULL,
	[start_date] [datetime2](7) NULL,
	[end_date] [datetime2](7) NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[messages]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sender_id] [int] NULL,
	[receiver_id] [int] NULL,
	[parent_id] [int] NULL,
	[subject] [nvarchar](255) NULL,
	[message] [nvarchar](max) NOT NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_items]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[product_id] [int] NULL,
	[variant_id] [int] NULL,
	[product_name] [nvarchar](255) NOT NULL,
	[product_image] [nvarchar](200) NULL,
	[price] [decimal](18, 2) NOT NULL,
	[quantity] [int] NOT NULL,
	[size] [nvarchar](50) NULL,
	[color] [nvarchar](50) NULL,
	[total] [decimal](18, 2) NOT NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_status_history]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_status_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[notes] [nvarchar](200) NULL,
	[created_by] [int] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[orders]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[orders](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[seller_id] [int] NULL,
	[order_number] [nvarchar](50) NOT NULL,
	[subtotal] [decimal](18, 2) NOT NULL,
	[shipping_cost] [decimal](18, 2) NULL,
	[tax] [decimal](18, 2) NULL,
	[discount] [decimal](18, 2) NULL,
	[total] [decimal](18, 2) NOT NULL,
	[shipping_address] [nvarchar](200) NULL,
	[shipping_city] [nvarchar](100) NULL,
	[shipping_country] [nvarchar](100) NULL,
	[shipping_phone] [nvarchar](50) NULL,
	[payment_method] [nvarchar](50) NULL,
	[payment_status] [nvarchar](20) NULL,
	[status] [nvarchar](20) NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[payments]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[user_id] [int] NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[payment_method] [nvarchar](50) NOT NULL,
	[transaction_id] [nvarchar](255) NULL,
	[status] [nvarchar](20) NULL,
	[payment_date] [datetime2](7) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[payouts]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payouts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[seller_id] [int] NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[payment_method] [nvarchar](50) NULL,
	[transaction_id] [nvarchar](255) NULL,
	[status] [nvarchar](20) NULL,
	[payout_date] [datetime2](7) NULL,
	[notes] [nvarchar](200) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[product_images]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[product_images](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[product_id] [int] NOT NULL,
	[image_url] [nvarchar](200) NOT NULL,
	[sort_order] [int] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[product_variants]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[product_variants](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[product_id] [int] NOT NULL,
	[sku] [nvarchar](100) NULL,
	[size] [nvarchar](50) NULL,
	[color] [nvarchar](50) NULL,
	[price_modifier] [decimal](18, 2) NULL,
	[stock] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[products]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[products](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[seller_id] [int] NULL,
	[category_id] [int] NULL,
	[subcategory_id] [int] NULL,
	[name] [nvarchar](255) NOT NULL,
	[slug] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[price] [decimal](18, 2) NOT NULL,
	[original_price] [decimal](18, 2) NULL,
	[discount_percent] [decimal](5, 2) NULL,
	[stock] [int] NULL,
	[sku] [nvarchar](100) NULL,
	[image_url] [nvarchar](200) NULL,
	[colors] [nvarchar](200) NULL,
	[sizes] [nvarchar](200) NULL,
	[rating] [decimal](3, 2) NULL,
	[reviews_count] [int] NULL,
	[is_flash_deal] [bit] NULL,
	[is_trending] [bit] NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[profiles]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[profiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[full_name] [nvarchar](255) NULL,
	[phone] [nvarchar](50) NULL,
	[avatar_url] [nvarchar](200) NULL,
	[address] [nvarchar](200) NULL,
	[city] [nvarchar](100) NULL,
	[country] [nvarchar](100) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
	[profile_type] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[refresh_tokens]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[refresh_tokens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[token] [nvarchar](200) NOT NULL,
	[expires_at] [datetime2](7) NOT NULL,
	[is_revoked] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[product_id] [int] NOT NULL,
	[user_id] [int] NULL,
	[order_id] [int] NULL,
	[rating] [int] NOT NULL,
	[title] [nvarchar](200) NULL,
	[comment] [nvarchar](max) NULL,
	[is_verified] [bit] NULL,
	[is_approved] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role_permissions]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role_permissions](
	[id] [uniqueidentifier] NOT NULL,
	[role] [nvarchar](20) NOT NULL,
	[page] [nvarchar](50) NOT NULL,
	[can_view] [bit] NULL,
	[can_create] [bit] NULL,
	[can_edit] [bit] NULL,
	[can_delete] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UQ_role_permissions] UNIQUE NONCLUSTERED 
(
	[role] ASC,
	[page] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sellers]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[settings]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[settings](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[key] [nvarchar](100) NOT NULL,
	[value] [nvarchar](max) NULL,
	[description] [nvarchar](200) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[subcategories]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[subcategories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[category_id] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[slug] [nvarchar](100) NOT NULL,
	[image_url] [nvarchar](200) NULL,
	[sort_order] [int] NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_roles]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_roles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[role] [nvarchar](20) NOT NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 3/30/2026 4:45:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password_hash] [nvarchar](255) NOT NULL,
	[email_verified] [bit] NULL,
	[is_active] [bit] NULL,
	[last_login] [datetime2](7) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[addresses] ADD  DEFAULT ((0)) FOR [is_default]
GO
ALTER TABLE [dbo].[addresses] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[addresses] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT ((0)) FOR [sort_order]
GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[marketing_campaigns] ADD  DEFAULT ('draft') FOR [status]
GO
ALTER TABLE [dbo].[marketing_campaigns] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[marketing_campaigns] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[order_items] ADD  DEFAULT ((1)) FOR [quantity]
GO
ALTER TABLE [dbo].[order_items] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[order_status_history] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ((0)) FOR [shipping_cost]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ((0)) FOR [tax]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ((0)) FOR [discount]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ('pending') FOR [payment_status]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[payouts] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[payouts] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payouts] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[product_images] ADD  DEFAULT ((0)) FOR [sort_order]
GO
ALTER TABLE [dbo].[product_images] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[product_variants] ADD  DEFAULT ((0)) FOR [price_modifier]
GO
ALTER TABLE [dbo].[product_variants] ADD  DEFAULT ((0)) FOR [stock]
GO
ALTER TABLE [dbo].[product_variants] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[product_variants] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [discount_percent]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [stock]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [reviews_count]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [is_flash_deal]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((0)) FOR [is_trending]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[profiles] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[profiles] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[refresh_tokens] ADD  DEFAULT ((0)) FOR [is_revoked]
GO
ALTER TABLE [dbo].[refresh_tokens] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reviews] ADD  DEFAULT ((0)) FOR [is_verified]
GO
ALTER TABLE [dbo].[reviews] ADD  DEFAULT ((1)) FOR [is_approved]
GO
ALTER TABLE [dbo].[reviews] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reviews] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT ((0)) FOR [can_view]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT ((0)) FOR [can_create]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT ((0)) FOR [can_edit]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT ((0)) FOR [can_delete]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[role_permissions] ADD  DEFAULT (getutcdate()) FOR [updated_at]
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
ALTER TABLE [dbo].[settings] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[settings] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[subcategories] ADD  DEFAULT ((0)) FOR [sort_order]
GO
ALTER TABLE [dbo].[subcategories] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[subcategories] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[subcategories] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[user_roles] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [email_verified]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getutcdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getutcdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[addresses]  WITH CHECK ADD CHECK  (([label]='other' OR [label]='work' OR [label]='home'))
GO
ALTER TABLE [dbo].[marketing_campaigns]  WITH CHECK ADD CHECK  (([status]='completed' OR [status]='paused' OR [status]='active' OR [status]='draft'))
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD CHECK  (([payment_status]='refunded' OR [payment_status]='failed' OR [payment_status]='paid' OR [payment_status]='pending'))
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD CHECK  (([status]='cancelled' OR [status]='delivered' OR [status]='shipped' OR [status]='processing' OR [status]='confirmed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD CHECK  (([status]='refunded' OR [status]='failed' OR [status]='completed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[payouts]  WITH CHECK ADD CHECK  (([status]='failed' OR [status]='completed' OR [status]='processing' OR [status]='pending'))
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO
ALTER TABLE [dbo].[role_permissions]  WITH CHECK ADD CHECK  (([role]='user' OR [role]='seller' OR [role]='moderator' OR [role]='admin'))
GO
