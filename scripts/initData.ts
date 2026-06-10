import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'api', 'data');
const INIT_FLAG_FILE = path.join(DATA_DIR, '.initialized');

console.log('========================================');
console.log('  🚀 宠物寄养管理系统 - 数据初始化');
console.log('========================================\n');

const env = process.env.NODE_ENV || 'development';
console.log(`📋 当前环境: ${env.toUpperCase()}`);

const DEFAULT_STAFF = [
  {
    id: 's1',
    name: '赵小明',
    phone: '13900139001',
    skills: ['宠物护理', '犬类训练', '医疗护理'],
    baseSalary: 6000,
    performanceRate: 1.2,
    status: 'active',
    hireDate: '2024-06-01',
  },
  {
    id: 's2',
    name: '孙美丽',
    phone: '13900139002',
    skills: ['猫咪护理', '美容造型', '寄养管理'],
    baseSalary: 5500,
    performanceRate: 1.1,
    status: 'active',
    hireDate: '2024-09-15',
  },
  {
    id: 's3',
    name: '周大山',
    phone: '13900139003',
    skills: ['大型犬护理', '上门喂养', '行为矫正'],
    baseSalary: 6500,
    performanceRate: 1.3,
    status: 'active',
    hireDate: '2023-12-20',
  },
  {
    id: 's4',
    name: '吴丽丽',
    phone: '13900139004',
    skills: ['宠物护理', '医疗协助', '日常喂养'],
    baseSalary: 5000,
    performanceRate: 1.0,
    status: 'active',
    hireDate: '2025-04-10',
  },
  {
    id: 's5',
    name: '郑小刚',
    phone: '13900139005',
    skills: ['美容造型', '寄养管理', '猫咪护理'],
    baseSalary: 5800,
    performanceRate: 1.15,
    status: 'leave',
    hireDate: '2025-01-08',
  },
];

const DEFAULT_MEMBER_DISCOUNTS = [
  {
    id: 'md1',
    level: 'normal',
    levelName: '普通会员',
    discountRate: 1.0,
    minSpent: 0,
    description: '新客户默认等级，无折扣',
    active: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'md2',
    level: 'silver',
    levelName: '银卡会员',
    discountRate: 0.95,
    minSpent: 3000,
    description: '累计消费满3000元升级，享受95折优惠',
    active: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'md3',
    level: 'gold',
    levelName: '金卡会员',
    discountRate: 0.88,
    minSpent: 10000,
    description: '累计消费满10000元升级，享受88折优惠',
    active: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'md4',
    level: 'diamond',
    levelName: '钻石会员',
    discountRate: 0.8,
    minSpent: 30000,
    description: '累计消费满30000元升级，享受8折优惠，专属客服',
    active: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

interface InitResult {
  timestamp: string;
  env: string;
  staff: { count: number; names: string[] };
  memberDiscounts: { count: number; levels: string[] };
}

function writeInitFlag(result: InitResult) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(INIT_FLAG_FILE, JSON.stringify(result, null, 2), 'utf-8');
}

function isInitialized(): boolean {
  return fs.existsSync(INIT_FLAG_FILE);
}

function initStaff() {
  console.log('\n👤 初始化饲养员数据...');
  DEFAULT_STAFF.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} - ${s.status === 'active' ? '在职' : s.status === 'leave' ? '请假' : '离职'} | 基本工资: ¥${s.baseSalary} | 技能: ${s.skills.join('、')}`);
  });
  console.log(`✅ 饲养员初始化完成，共 ${DEFAULT_STAFF.length} 人`);
  return DEFAULT_STAFF;
}

function initMemberDiscounts() {
  console.log('\n💰 初始化会员等级与折扣...');
  DEFAULT_MEMBER_DISCOUNTS.forEach((d, i) => {
    const discountPercent = Math.round(d.discountRate * 100);
    const discountText = discountPercent === 100 ? '无折扣' : `${discountPercent}折`;
    console.log(`   ${i + 1}. ${d.levelName} (${d.level}) | ${discountText} | 门槛: 累计消费¥${d.minSpent}`);
  });
  console.log(`✅ 会员等级初始化完成，共 ${DEFAULT_MEMBER_DISCOUNTS.length} 个等级`);
  return DEFAULT_MEMBER_DISCOUNTS;
}

function main() {
  const forceInit = process.argv.includes('--force');

  if (isInitialized() && !forceInit) {
    console.log('ℹ️  数据已初始化，跳过初始化流程。');
    console.log('   如需重新初始化，请运行: npm run init:data -- --force');
    return;
  }

  if (forceInit) {
    console.log('⚠️  --force 模式：强制重新初始化数据\n');
  }

  const staff = initStaff();
  const discounts = initMemberDiscounts();

  const result: InitResult = {
    timestamp: new Date().toISOString(),
    env,
    staff: {
      count: staff.length,
      names: staff.map((s) => s.name),
    },
    memberDiscounts: {
      count: discounts.length,
      levels: discounts.map((d) => d.levelName),
    },
  };

  writeInitFlag(result);

  console.log('\n========================================');
  console.log('  ✅ 数据初始化完成!');
  console.log(`  📅 初始化时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`  👤 饲养员: ${result.staff.count} 人`);
  console.log(`  💎 会员等级: ${result.memberDiscounts.count} 个`);
  console.log('========================================\n');
}

main();
