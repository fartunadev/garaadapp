USE TanaCargo;
GO

CREATE OR ALTER PROCEDURE sp_GetRolePermissions
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, role, page, can_view, can_create, can_edit, can_delete, created_at, updated_at
  FROM dbo.role_permissions
  ORDER BY role, page;
END
GO

CREATE OR ALTER PROCEDURE sp_UpsertRolePermission
  @Role NVARCHAR(20),
  @Page NVARCHAR(50),
  @CanView BIT,
  @CanCreate BIT,
  @CanEdit BIT,
  @CanDelete BIT
AS
BEGIN
  SET NOCOUNT ON;
  MERGE dbo.role_permissions AS target
  USING (SELECT @Role AS role, @Page AS page) AS source ON target.role = source.role AND target.page = source.page
  WHEN MATCHED THEN
    UPDATE SET can_view = @CanView, can_create = @CanCreate, can_edit = @CanEdit, can_delete = @CanDelete, updated_at = GETUTCDATE()
  WHEN NOT MATCHED THEN
    INSERT (role, page, can_view, can_create, can_edit, can_delete)
    VALUES (@Role, @Page, @CanView, @CanCreate, @CanEdit, @CanDelete);

  SELECT * FROM dbo.role_permissions WHERE role = @Role AND page = @Page;
END
GO

PRINT 'Role Permissions Stored Procedures Created Successfully!';
GO
