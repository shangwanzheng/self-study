import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { PsButton } from '@pscae/ps-cae-cloud-ui';
import { useEmployeeStore } from '@/store/employee';
import { useGlobalStore } from '@/store/global';
import {
  createEmployee,
  fetchEmployees,
  fetchFailExample,
  removeEmployee,
  type Employee,
} from '@/services/employee';
import { alertMessage } from '@/utils/alertMessage';
import { t } from '@/utils/i18n';
import styles from './index.less';

interface Props {
  name: string;
  status?: '在职' | '离职';
  onSelect: () => void;
}

function deptLabel(dept: string | null | undefined): string {
  if (dept == null) {
    return '未分配';
  }
  return dept;
}

function UserCard(props: Props) {
  return (
    <button type="button" className={styles.card} onClick={props.onSelect}>
      <span className={`${styles.link} ${styles.name}`}>{props.name}</span>
      <span>{props.status}</span>
    </button>
  );
}

interface Draft {
  name: string;
  age: number | null;
  status: '在职' | '离职';
  dept?: string;
}

/**
 * Model：list、keyword、open
 * View：return 里的 JSX
 * ViewModel：EmployeePage 这个函数，拿数据算出界面，并接住点击和输入
 */
export default function EmployeePage() {
  const { userName } = useGlobalStore();
  const { selectedId, setSelectedId } = useEmployeeStore();
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Employee[]>([]);
  const [form] = Form.useForm<Draft>();

  async function loadList() {
    try {
      const data = await fetchEmployees();
      setList(data);
    } catch {
      alertMessage.error({ content: t('加载失败') });
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  const shown = list.filter((item) => item.name.includes(keyword.trim()));
  const selected = list.find((item) => item.id === selectedId);

  async function save(values: Draft) {
    if (!values.name || values.age == null) {
      alertMessage.error({ content: t('请填写姓名和年龄') });
      return;
    }
    try {
      await createEmployee({
        name: values.name,
        age: values.age,
        active: true,
        tags: [],
        status: values.status,
        dept: values.dept,
      });
      alertMessage.success({ content: t('保存成功') });
      setOpen(false);
      await loadList();
    } catch {
      alertMessage.error({ content: t('保存失败') });
    }
  }

  async function remove(id: string) {
    try {
      await removeEmployee(id);
      alertMessage.success({ content: t('删除成功') });
      if (selectedId === id) {
        setSelectedId(null);
      }
      await loadList();
    } catch {
      alertMessage.error({ content: t('删除失败') });
    }
  }

  function confirmRemove(record: Employee) {
    Modal.confirm({
      title: t('确认删除'),
      content: record.name,
      onOk: () => remove(record.id),
    });
  }

  async function showFail() {
    try {
      await fetchFailExample();
    } catch {
      alertMessage.error({ content: t('请求失败') });
    }
  }

  const columns: ColumnsType<Employee> = [
    { title: t('姓名'), dataIndex: 'name' },
    { title: t('年龄'), dataIndex: 'age' },
    { title: t('状态'), dataIndex: 'status' },
    {
      title: t('在岗'),
      dataIndex: 'active',
      render: (active: boolean) => (active ? t('是') : t('否')),
    },
    {
      title: t('部门'),
      dataIndex: 'dept',
      render: (dept: string | null | undefined) => deptLabel(dept),
    },
    {
      title: t('标签'),
      dataIndex: 'tags',
      render: (tags: string[]) => (tags.length > 0 ? tags.join('、') : t('无')),
    },
    {
      title: t('操作'),
      render: (_value, record) => (
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            confirmRemove(record);
          }}
        >
          {t('删除')}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <h1 className={styles.title}>{t('员工')}</h1>
        <p className={styles.meta}>
          {t('当前用户')}：{userName}
          {' · '}
          <Link className={styles.link} to="/employee">
            {t('员工')}
          </Link>
          {' · '}
          {t('选中')}：{selected ? selected.name : t('无')}
        </p>
        <div className={styles.toolbar}>
          <Input
            className={styles.search}
            value={keyword}
            placeholder={t('按姓名筛选')}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            {t('新建')}
          </Button>
          <PsButton onClick={loadList}>{t('刷新')}</PsButton>
          <Button onClick={showFail}>{t('看一条失败请求')}</Button>
        </div>
        <div className={styles.cards}>
          {shown.map((item) => (
            <UserCard
              key={item.id}
              name={item.name}
              status={item.status}
              onSelect={() => setSelectedId(item.id)}
            />
          ))}
        </div>
        <Table<Employee>
          rowKey="id"
          columns={columns}
          dataSource={shown}
          pagination={false}
          onRow={(record) => ({
            onClick: () => setSelectedId(record.id),
          })}
        />
      </div>
      <Modal
        open={open}
        title={t('新建员工')}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form<Draft> form={form} onFinish={save} initialValues={{ status: '在职' }}>
          <Form.Item name="name" label={t('姓名')}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label={t('年龄')}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label={t('状态')}>
            <Select
              options={[
                { value: '在职', label: t('在职') },
                { value: '离职', label: t('离职') },
              ]}
            />
          </Form.Item>
          <Form.Item name="dept" label={t('部门')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
