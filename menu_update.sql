-- 删除农机管理菜单及其子菜单
DELETE FROM `sys_menu` WHERE `menu_id` = 2039;

-- 更新农资信息管理菜单的权限标识
UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resource:list',
  `update_time` = NOW()
WHERE `menu_id` = 2038;

-- 添加农资信息管理的按钮权限
-- 新增
INSERT INTO `sys_menu` VALUES (2125, '新增', 2038, 1, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resource:add', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 修改
INSERT INTO `sys_menu` VALUES (2126, '修改', 2038, 2, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resource:edit', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 删除
INSERT INTO `sys_menu` VALUES (2127, '删除', 2038, 3, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resource:remove', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 导出
INSERT INTO `sys_menu` VALUES (2128, '导出', 2038, 4, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resource:export', '#', 'admin', NOW(), 'admin', NOW(), '');

-- 更新农资使用管理菜单的权限标识
UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resourceusage:list',
  `update_time` = NOW()
WHERE `menu_id` = 2114;

-- 更新农资使用管理的按钮权限
UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resourceusage:add',
  `update_time` = NOW()
WHERE `menu_id` = 2115;

UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resourceusage:edit',
  `update_time` = NOW()
WHERE `menu_id` = 2116;

UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resourceusage:remove',
  `update_time` = NOW()
WHERE `menu_id` = 2117;

UPDATE `sys_menu` SET 
  `perms` = 'agriculture:resourceusage:export',
  `update_time` = NOW()
WHERE `menu_id` = 2118;

-- 添加农资库存管理菜单
INSERT INTO `sys_menu` VALUES (2129, '农资库存管理', 2113, 2, 'material/materialinventory', 'agriculture/material/materialInventory/index', NULL, '', 1, 0, 'C', '0', '0', 'agriculture:resourceinventory:list', '&#xe8dc;', 'admin', NOW(), 'admin', NOW(), '农资库存管理');

-- 添加农资库存管理的按钮权限
-- 新增
INSERT INTO `sys_menu` VALUES (2130, '新增', 2129, 1, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resourceinventory:add', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 修改
INSERT INTO `sys_menu` VALUES (2131, '修改', 2129, 2, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resourceinventory:edit', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 删除
INSERT INTO `sys_menu` VALUES (2132, '删除', 2129, 3, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resourceinventory:remove', '#', 'admin', NOW(), 'admin', NOW(), '');
-- 导出
INSERT INTO `sys_menu` VALUES (2133, '导出', 2129, 4, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'agriculture:resourceinventory:export', '#', 'admin', NOW(), 'admin', NOW(), '');

