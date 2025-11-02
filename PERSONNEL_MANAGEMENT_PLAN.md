# 人员管理模块复用方案

## 一、若依现有功能分析

### ✅ 已存在的功能模块

| 模块 | 路径 | 功能 | 复用性 |
|------|------|------|--------|
| **用户管理** | `src/views/system/user/index.vue` | 用户账号、昵称、部门、角色、岗位、状态管理 | ✅ 完全可用 |
| **角色管理** | `src/views/system/role/index.vue` | 角色定义、权限分配、数据权限、用户分配 | ✅ 完全可用 |
| **部门管理** | `src/views/system/dept/index.vue` | 部门树形结构、部门信息管理 | ✅ 完全可用 |
| **岗位管理** | `src/views/system/post/index.vue` | 岗位编码、岗位名称、状态管理 | ✅ 完全可用 |

### 若依用户管理包含的功能
- ✅ **员工档案录入**：用户账号、昵称、手机号、邮箱、部门、角色、岗位、状态
- ✅ **角色定义**：角色名称、权限字符、菜单权限、数据权限
- ✅ **部门层级管理**：树形结构、部门负责人、联系电话
- ✅ **岗位管理**：岗位编码、岗位名称、显示顺序

**结论：图片中第一阶段的人员管理需求（7.1 员工信息管理、角色定义）已完全满足！**

---

## 二、复用方案

### 方案A：直接复用（推荐）

**优点：**
- 无需重复开发，节省开发时间
- 统一的权限体系和数据模型
- 用户/角色/部门/岗位数据统一管理

**实施方案：**
1. **直接使用现有模块**
   - 用户管理：`/system/user/index`
   - 角色管理：`/system/role/index`
   - 部门管理：`/system/dept/index`
   - 岗位管理：`/system/post/index`

2. **在菜单中标识为"人员管理"**
   - 可以将这些模块组织在一个"人员管理"菜单组下
   - 菜单路径：系统管理 → 人员管理 → [用户/角色/部门/岗位]

3. **扩展用户字段（如需要）**
   - 如果农业业务需要额外字段（如员工编号、技能标签等），可以：
     - 方案1：扩展sys_user表，添加农业相关字段
     - 方案2：创建agriculture_employee_profile表，关联userId

### 方案B：包装复用

创建一个"农业人员管理"入口页面，集成若依的管理功能：

```
src/views/agriculture/personnel/index.vue
├── 使用Tab切换
│   ├── 用户管理 (嵌入 /system/user/index)
│   ├── 角色管理 (嵌入 /system/role/index)
│   ├── 部门管理 (嵌入 /system/dept/index)
│   └── 岗位管理 (嵌入 /system/post/index)
└── 新增农业业务扩展功能
    ├── 技能管理
    ├── 排班管理
    └── 工时管理
```

---

## 三、需要扩展的功能

### 第一阶段：任务分配管理（7.2）

**现有情况：** 若依没有专门的任务分配管理

**需要实现：**
1. **任务类型管理**
   - 实体：`TaskType`
   - 字段：taskTypeId, taskTypeName, description, category
   - 功能：创建、编辑、删除任务类型（如：种植、施肥、采收等）

2. **任务分配权限设置**
   - 可以在角色管理中扩展，通过权限字符控制
   - 或者创建任务权限配置表，关联roleId和taskTypeId

**实现建议：**
```typescript
// 新增 src/api/agriculture/taskTypeApi.ts
// 新增 src/views/agriculture/taskType/index.vue
```

### 第二阶段：高级人员管理功能

#### 1. 技能管理（7.3）

**需要实现：**
- **技能标签设置**
  - 实体：`Skill`
  - 字段：skillId, skillName, skillCategory, description
- **员工技能匹配**
  - 实体：`EmployeeSkill` (多对多关系)
  - 字段：userId, skillId, level (熟练程度)

**实现建议：**
```typescript
// 新增 src/api/agriculture/skillApi.ts
// 新增 src/views/agriculture/skill/index.vue
// 在用户详情页或单独页面管理员工技能
```

#### 2. 排班管理（7.4）

**需要实现：**
- **排班规则设置**
  - 实体：`ScheduleRule`
  - 字段：ruleId, ruleName, workDays, startTime, endTime, greenhouseId
- **排班表生成**
  - 实体：`Schedule`
  - 字段：scheduleId, userId, greenhouseId, workDate, shiftType, status

**实现建议：**
```typescript
// 新增 src/api/agriculture/scheduleApi.ts
// 新增 src/views/agriculture/schedule/index.vue
// 使用日历组件展示排班表
```

#### 3. 工作量评估（7.5）

**需要实现：**
- **任务工作量核算**
  - 可以在任务表中添加工作量字段
  - 或创建工作量标准表：taskTypeId → estimatedHours

**实现建议：**
- 在现有的batchTask或TaskDetail中扩展
- 添加工作量字段和相关统计功能

#### 4. 工时管理（7.6）

**需要实现：**
- **工时记录**
  - 实体：`WorkTimeRecord`
  - 字段：recordId, userId, taskId, workDate, startTime, endTime, hours, remark
- **考勤关联**
  - 与排班表关联，自动比对出勤情况

**实现建议：**
```typescript
// 新增 src/api/agriculture/workTimeApi.ts
// 新增 src/views/agriculture/workTime/index.vue
```

---

## 四、数据库设计建议

### 扩展用户信息（可选）

如果需要为农业业务扩展用户信息，可以创建扩展表：

```sql
-- 农业员工扩展信息表
CREATE TABLE agriculture_employee_profile (
    profile_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,  -- 关联sys_user.user_id
    employee_code VARCHAR(50), -- 员工编号
    hire_date DATE,            -- 入职日期
    work_status VARCHAR(20),   -- 工作状态
    remark VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES sys_user(user_id)
);
```

### 任务相关表

```sql
-- 任务类型表
CREATE TABLE agriculture_task_type (
    task_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_type_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),      -- 分类：种植、养护、采收等
    description VARCHAR(500),
    estimated_hours DECIMAL(10,2), -- 预估工时
    del_flag CHAR(1) DEFAULT '0'
);

-- 员工技能关联表
CREATE TABLE agriculture_employee_skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    skill_level VARCHAR(20),  -- 熟练程度：初级/中级/高级
    FOREIGN KEY (user_id) REFERENCES sys_user(user_id),
    FOREIGN KEY (skill_id) REFERENCES agriculture_skill(skill_id)
);
```

---

## 五、实施步骤

### 第一步：确认复用方案 ✅
- [x] 确认若依的用户/角色/部门/岗位管理功能完整
- [x] 确认可以满足第一阶段人员管理需求

### 第二步：集成现有模块
- [ ] 在菜单中组织人员管理相关模块
- [ ] 如有需要，创建包装页面统一入口

### 第三步：实现任务分配管理（第一阶段）
- [ ] 创建任务类型管理API和页面
- [ ] 在角色管理中关联任务权限

### 第四步：实现高级功能（第二阶段）
- [ ] 技能管理
- [ ] 排班管理
- [ ] 工作量评估（在任务模块中扩展）
- [ ] 工时管理

---

## 六、代码示例

### 复用若依用户管理的示例

```vue
<!-- src/views/agriculture/personnel/index.vue -->
<template>
  <div class="personnel-management">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="用户管理" name="user">
        <!-- 可以重定向到用户管理页面 -->
        <UserManagement />
      </el-tab-pane>
      <el-tab-pane label="角色管理" name="role">
        <RoleManagement />
      </el-tab-pane>
      <el-tab-pane label="部门管理" name="dept">
        <DeptManagement />
      </el-tab-pane>
      <el-tab-pane label="岗位管理" name="post">
        <PostManagement />
      </el-tab-pane>
      <el-tab-pane label="任务类型" name="taskType">
        <TaskTypeManagement />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 可以导入现有组件或使用路由跳转
import UserManagement from '@/views/system/user/index.vue'
import RoleManagement from '@/views/system/role/index.vue'
// ... 其他导入

const activeTab = ref('user')
</script>
```

---

## 七、总结

### ✅ 可以直接复用的功能
1. **用户管理** - 完全满足员工信息管理需求
2. **角色管理** - 完全满足角色定义需求
3. **部门管理** - 可用于组织架构管理
4. **岗位管理** - 可用于岗位职责管理

### 🆕 需要新增的功能
1. **任务类型管理** - 第一阶段
2. **技能管理** - 第二阶段
3. **排班管理** - 第二阶段
4. **工时管理** - 第二阶段
5. **工作量评估** - 第二阶段（可在任务模块中扩展）

### 📋 建议
- **强烈建议直接复用若依的用户/角色/部门/岗位管理**
- **节省开发时间，统一数据模型**
- **在此基础上扩展农业业务相关功能**

