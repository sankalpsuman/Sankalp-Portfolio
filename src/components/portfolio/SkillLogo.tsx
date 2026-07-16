import { useState, memo } from 'react';
import { Code, Database, Cpu, Globe, Terminal, FileCode2, Layers, Server, ShieldCheck, Box, Cloud, MonitorPlay } from 'lucide-react';

// Maps a normalized skill name to a SimpleIcons slug and preferred hex color.
// If the color is omitted, simpleicons defaults to the brand color.
const SKILL_SLUGS: Record<string, string> = {
  python: 'python',
  docker: 'docker',
  selenium: 'selenium',
  playwright: 'playwright',
  react: 'react',
  reactjs: 'react',
  firebase: 'firebase',
  git: 'git',
  github: 'github',
  jenkins: 'jenkins',
  jira: 'jira',
  confluence: 'confluence',
  typescript: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  html: 'html5',
  html5: 'html5',
  css: 'css3',
  css3: 'css3',
  sql: 'mysql',
  mysql: 'mysql',
  postgresql: 'postgresql',
  postman: 'postman',
  swagger: 'swagger',
  openai: 'openai',
  chatgpt: 'openai',
  gemini: 'googlegemini',
  nodejs: 'nodedotjs',
  node: 'nodedotjs',
  express: 'express',
  mongodb: 'mongodb',
  aws: 'amazonaws',
  azure: 'microsoftazure',
  gcp: 'googlecloud',
  kubernetes: 'kubernetes',
  linux: 'linux',
  ubuntu: 'ubuntu',
  centos: 'centos',
  redhat: 'redhat',
  apple: 'apple',
  windows: 'windows',
  android: 'android',
  ios: 'ios',
  swift: 'swift',
  kotlin: 'kotlin',
  java: 'java',
  csharp: 'csharp',
  cplusplus: 'cplusplus',
  c: 'c',
  php: 'php',
  ruby: 'ruby',
  rust: 'rust',
  golang: 'go',
  go: 'go',
  dart: 'dart',
  flutter: 'flutter',
  angular: 'angular',
  vue: 'vuedotjs',
  vuejs: 'vuedotjs',
  svelte: 'svelte',
  nextjs: 'nextdotjs',
  nuxtjs: 'nuxtdotjs',
  gatsby: 'gatsby',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  sass: 'sass',
  less: 'less',
  webpack: 'webpack',
  vite: 'vite',
  babel: 'babel',
  eslint: 'eslint',
  prettier: 'prettier',
  jest: 'jest',
  mocha: 'mocha',
  cypress: 'cypress',
  graphql: 'graphql',
  apollo: 'apollographql',
  redux: 'redux',
  mobx: 'mobx',
  rxjs: 'reactivex',
  npm: 'npm',
  yarn: 'yarn',
  pnpm: 'pnpm',
  githubactions: 'githubactions',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  figma: 'figma',
  adobexd: 'adobexd',
  sketch: 'sketch',
  photoshop: 'adobephotoshop',
  illustrator: 'adobeillustrator',
  slack: 'slack',
  discord: 'discord',
  trello: 'trello',
  asana: 'asana',
  notion: 'notion',
  zephyr: 'zephyr',
  octane: 'microfocus',
  alm: 'microfocus',
  qc: 'microfocus'
};

const normalizeName = (name: string) => {
  return name.toLowerCase().replace(/[\s\-_]/g, '');
};

const FallbackIcon = ({ name, className }: { name: string, className?: string }) => {
  const norm = normalizeName(name);
  if (norm.includes('database') || norm.includes('sql') || norm.includes('data')) return <Database className={className} />;
  if (norm.includes('api') || norm.includes('backend') || norm.includes('server')) return <Server className={className} />;
  if (norm.includes('cloud') || norm.includes('aws') || norm.includes('azure')) return <Cloud className={className} />;
  if (norm.includes('qa') || norm.includes('test') || norm.includes('quality')) return <ShieldCheck className={className} />;
  if (norm.includes('ai') || norm.includes('machine') || norm.includes('gpt')) return <Cpu className={className} />;
  if (norm.includes('web') || norm.includes('front') || norm.includes('ui')) return <Globe className={className} />;
  if (norm.includes('tool') || norm.includes('terminal') || norm.includes('cli')) return <Terminal className={className} />;
  return <Code className={className} />;
};

interface SkillLogoProps {
  name: string;
  className?: string;
}

export const SkillLogo = memo(({ name, className = "w-4 h-4" }: SkillLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const norm = normalizeName(name);
  
  // Try exact match first
  let slug = SKILL_SLUGS[norm];
  
  // If not found, try partial match for some common multi-word skills 
  // like "Python (Basics)" -> "python", "SQL & Database" -> "sql"
  if (!slug) {
    for (const [key, val] of Object.entries(SKILL_SLUGS)) {
      if (norm.includes(key)) {
        slug = val;
        break;
      }
    }
  }

  if (slug && !imgError) {
    return (
      <img 
        src={`https://cdn.simpleicons.org/${slug}`} 
        alt={`${name} logo`}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return <FallbackIcon name={name} className={className} />;
});
