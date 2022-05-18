文档：
    https://pro.ant.design/index-cn
    http://ant.design/

//takeLatest, throttle: https://blog.csdn.net/wangweiren_get/article/details/89043113
用户直接用windw.USER，注意判空

列表+详情+新增+编辑+删除：TableList

配置菜单：config/routes.js
图片放置在public文件夹下，public文件夹的文件在部署时会直接部署在和js一样的目录，所以部署后访问：比如访问public下的logo.png文件：DOMAIN/logo.png即可

绑定键盘事件：https://github.com/yuanguandong/react-keyevent
参考登录页面
<Keyevent
    events={{
    onEnter: (e) => {
        // console.log('enter key event', e, formRef)
        formRef.current.submit();
    },
    }}
    needFocusing={false}
>
</Keyevent>

带权限的组件：
  场景：渲染一个带权限的组件。比如在列表页面，某个按钮只有某个权限的用户或角色才能看到。或者某个div之类的，也是一样。
  用法：使用coryAuthority里的AuthorizedComponent组件。
  举例：
    import { AuthorizedComponent } from '@/utils/coryAuthority';
    <AuthorizedComponent path='/admin'>This is an AuthorizedComponent.</AuthorizedComponent>

富文本编辑器：https://braft.margox.cn/
集成到表单中
没有外边框处理：加样式：https://github.com/margox/braft-editor/issues/564
和 ant.design 的form 表单一起使用，数据加载不上：https://github.com/margox/braft-editor/issues/341
编辑和展示都已经由系统封装好，只需要在后台@Field里加richText=true即可。
但是需要上传文件时要自己传入uploadHandler参数。具体见TableList的注释。

数据字典编辑器，如果类型是数据字典，只需要渲染成数据字典编辑器(用editRenderer来指定)，就会自动渲染成下拉列表
  DatadictEditor
数据字典类型的编辑：字段已经通过后台的设置，然后前端已经内置实现，一般情况下不用自己处理。特殊情况另说。
数据字典字段的展示：后台会查询关联的数据字典，前端自己写listRenderer来渲染。比如level，后台查询到存储成了levelName，前端listRenderer加：{level: (v, r) => r.levelName}

自定义表单：
  使用场景，在列表页面，需要做某些数据修改，比如有一个微信用户列表，要修改用户角色和手机号，此时需要一个弹出框，然后下拉选择角色，并输入一下电话号，然后保存。
  其中角色是后端定义好的枚举，在前端需要渲染成下拉选择。
  此时可以自己定义表单来输入。注意的点： 
    #、枚举：直接使用utils里的getEnumDataSource方法获取到枚举数据源。具体见方法注释
    #、form的layout已经在utils里定义了一个默认的，可以直接用，如果不够用可以自行定义
    #、数据字典也是要渲染成下拉选择，见上面的数据字典描述
    #、还可以根据条件动态渲染某些字段，比如需要角色A才输入电话号，其它角色不用输入
  具体例子如下：
    /******************* 自定义表单示例开始 **********************/
    import { log, getEnumDataSource, layout, tailLayout } from '@/utils/utils';
    //其它import请自行引入

    const Page = () => {
      const [ loading, setLoading ] = useState(false);
      const [ form ] = Form.useForm();
      const [ user, setUser ] = useState();
      const [ actionRef, setActionRef ] = useState();
      const [ roleModalVisible, setRoleModalVisible ] = useState(false);

      const startChangeRole = (record, actionRef) => {
        setUser(record);
        setActionRef(actionRef);

        request.get(ctx + 'ajax/xxx/xxx/getByOpenid', {data: {openid: record.openid}}).then(u => {
          const initValues = {
            role: record.role,
            name: u.name,
            phone: u.phone,
          };

          log('init values', initValues);

          form.setFieldsValue(initValues);
          setRoleModalVisible(true);
        });
      };

      const submitChangeRole = (values) => {
        setLoading(true);
        log(values);
        request.post(ctx + 'ajax/xxx/xxx/changeRole', {data: {...values, id: user.id}}).then(success => {
          setLoading(false);
          if (success) {
            message.success('角色修改成功');
            actionRef.current.reload();
            cancelChangeRole();
          } else {
            message.error('角色修改失败');
          }
        });
      };

      const cancelChangeRole = () => {
        setUser(null);
        setRoleModalVisible(false);
        form.resetFields();
      };

      return (
        <PageContainer>
          <TableList 
            model="com.cory.model.WxUser" 
            showId={true} 
            operationList={[{label: '修改角色', handler: (record, actionRef) => startChangeRole(record, actionRef), icon: <UserSwitchOutlined />}]}
          />

          <Modal title="修改角色" visible={roleModalVisible} footer={null} closable={false} maskClosable={false} destroyOnClose={true}>
            <Spin spinning={loading}>
              <Form {...layout} onFinish={submitChangeRole} form={form}>
                <Form.Item name="role" label="角色" rules={[{required: true}]}>
                  <Select placeholder="请选择角色">
                    {getEnumDataSource('WxUserRole').map(e => <Option key={e.value} value={e.value}>{e.label}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="name" label="姓名" rules={[{required: true}]}>
                  <Input placeholder='请输入姓名' />
                </Form.Item>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) =>
                    (getFieldValue('role') === 'A') ? (
                      <Form.Item name="phone" label="电话" rules={[{required: true}]}>
                        <Input placeholder='请输入电话' />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                  <Button type="normal" onClick={cancelChangeRole} className="margin-left-8">
                    取消
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        </PageContainer>
      );
    };

    export default Page;
    /******************* 自定义表单示例结束 **********************/

本地运行：
cnpm start
注意：如果没有cnpm，请先安装。如果启动错误，请先cnpm install

部署：
1、运行：cnpm run build 进行打包
2、打包完成后将dist目录下的所有文件上传到服务器目录即可

用单独的域名访问，比如：xxcdn.xx.com
上传文件也用单独域名访问，比如：xxdata.xx.com

-------------
DONE:
    新建、编辑的校验：基本校验
    新增、编辑、删除的处理
    ID字段处理
    甚至全部自定义：全部自定义就自己写即可，不要用TableList
    首页：returnUrl不起作用、登录显示两边成功、登录成功时要显示之前的样子
    新建、编辑时的自定义？比如枚举、下拉等
    自定义：渲染、过滤条件渲染（主要是枚举）、自定义操作
    分配资源那里自定义
    增加执行sql的功能，图标：<ConsoleSqlOutlined />

TODO:
    首页

扩展：
    字段定义：比如密码：password：true