/**
 * 路由别名枚举
 * 
 * 用途：
 * 1. 统一管理路由路径，避免硬编码
 * 2. 在动态路由注册时，可以通过别名快速定位组件
 * 3. 提高代码可维护性，路径变更时只需修改此处
 */
export enum RoutesAlias {
  Home = '/index/index', // 首页布局组件
  Login = '/login', // 登录页面
  Register = '/register', // 注册页面
  ForgetPassword = '/forget-password', // 忘记密码页面
  Exception403 = '/exception/403', // 403 无权限页面
  Exception404 = '/exception/404', // 404 页面不存在
  Exception500 = '/exception/500', // 500 服务器错误
  Dashboard = '/console/index', // 工作台/控制台页面
  UserCenter = '/user/user', // 用户中心页面
  GenEdit = '/tool/gen/edit-table', // 代码生成器编辑页面
  DictData = '/system/dict/data', // 字典数据管理页面
  AuthRole = '/system/user/authRole', // 用户授权角色页面
  JobLog = '/monitor/job/log', // 调度日志页面
  OutsideIframe = '/outside/iframe', // 外部 iframe 页面
  ChangeLog = '/log/ChangeLog' // 更新日志页面
}
