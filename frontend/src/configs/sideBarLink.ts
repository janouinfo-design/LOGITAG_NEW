type MenuItem = {
  title: string
  to: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  olang?: string
}
export type MenuLink = {
  title: string
  to: string
  fontIcon: string
  hasBullet: Boolean
  olang?: string
  icon?: string
  children?: Array<MenuItem>
}

const links: Array<MenuLink> = [
  {
    title: 'Company',
    fontIcon: 'fas fa-map',
    icon: '',
    to: '/company',
    hasBullet: false,
  },
  {
    title: 'Setup Info',
    fontIcon: '',
    icon: 'ki-duotone ki-wrench',
    to: '/setupInfo',
    hasBullet: false,
  },
  {
    title: 'Invoices',
    fontIcon: '',
    icon: 'element-plus',
    to: '/invoice',
    hasBullet: false,
    children: [
      {
        title: 'Liste',
        to: 'list',
        olang: 'invoice.list',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Tags',
    fontIcon: '',
    icon: 'element-plus',
    to: '/tags',
    hasBullet: false,
    children: [
      {
        title: 'Liste',
        to: 'list',
        olang: 'tag.list',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Resources',
    fontIcon: '',
    icon: 'element-plus',
    to: '',
    hasBullet: false,
    children: [
      {
        title: 'Engine',
        to: 'engine/list',
        olang: 'engine.list',
        hasBullet: true,
      },
      {
        title: 'Equipes',
        to: 'equipes/list',
        olang: 'equipes.list',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Site',
    fontIcon: '',
    icon: 'element-plus',
    to: '/site',
    hasBullet: false,
    children: [
      {
        title: 'Liste',
        to: 'list',
        olang: 'site.list',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Clients',
    fontIcon: '',
    icon: 'element-plus',
    to: '/customers',
    hasBullet: false,
    children: [
      {
        title: 'Liste',
        to: 'list',
        olang: 'customer.list',
        hasBullet: true,
      },
      {
        title: 'Adresses',
        to: 'addresses',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Status',
    fontIcon: 'bi-archive',
    icon: 'element-plus',
    to: '/statuses',
    olang: 'status',
    hasBullet: false,
  },
  {
    title: 'Planning',
    fontIcon: 'bi-archive',
    icon: 'ki-duotone ki-wrench',
    to: '/planning',
    hasBullet: false,
    children: [
      {
        title: 'vue list',
        to: '/list',
        hasBullet: true,
      },
      {
        title: 'vue timeline',
        to: 'timeline',
        hasBullet: true,
      },
    ],
  },
  {
    title: 'Geofence',
    fontIcon: 'bi-archive',
    icon: 'ki-duotone ki-map',
    to: '/geofencing',
    hasBullet: false,
  },
  {
    title: 'Status',
    fontIcon: 'bi-archive',
    icon: 'ki-duotone ki-map',
    to: '/statuses',
    hasBullet: false,
  },
  {
    title: 'Deposits',
    fontIcon: 'bi-archive',
    icon: 'ki-duotone ki-map',
    to: '/deposits',
    olang: 'deposit.name',
    hasBullet: false,
  },
  {
    title: 'Vehicules',
    fontIcon: '',
    icon: 'element-plus',
    to: '/vehicles',
    olang: 'car.title',
    hasBullet: false,
    children: [
      {
        title: 'vue map',
        to: '',
        hasBullet: true,
      },
    ],
  },
]

export default links
