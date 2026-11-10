import { ChangeDetectionStrategy, Component } from '@angular/core';
import { at } from './code';

// Hand-drawn architecture (inline SVG, vertical so it stays legible at 390px). Every box links to its line in
// main.tf; line numbers come from the build-time index, so they follow the file if it changes.
@Component({
  selector: 'app-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<svg class="dg" viewBox="0 0 440 816" role="group" aria-labelledby="dg-t">
  <title id="dg-t">Arquitetura criada pelo main.tf</title>

  <!-- 1 Internet -->
  <a [attr.href]="'#L' + at('aws_security_group.main_sg:ingress')" [attr.aria-label]="'Internet. Regra de entrada SSH, linha ' + at('aws_security_group.main_sg:ingress')">
    <rect class="nr" x="150" y="12" width="140" height="48" rx="24"/>
    <text class="tt" x="220" y="33" text-anchor="middle">Internet</text>
    <text class="ts" x="220" y="50" text-anchor="middle">0.0.0.0/0</text>
  </a>
  <g class="flow"><path d="M220 66V122"/><path class="hd" d="M215 72l5-7 5 7z"/><path class="hd" d="M215 117l5 7 5-7z"/></g>

  <!-- region + 4 VPC -->
  <rect class="zone" x="10" y="98" width="420" height="606" rx="16"/>
  <text class="ts dim" x="24" y="120">AWS · us-east-1</text>
  <a [attr.href]="'#L' + at('aws_vpc.main_vpc')" [attr.aria-label]="'VPC 10.0.0.0/16, linha ' + at('aws_vpc.main_vpc')">
    <rect class="nr vpc" x="24" y="150" width="392" height="540" rx="14"/>
    <text class="tt" x="40" y="186">VPC</text>
    <text class="ts" x="40" y="203">10.0.0.0/16</text>
  </a>

  <!-- 2 IGW -->
  <a [attr.href]="'#L' + at('aws_internet_gateway.main_igw')" [attr.aria-label]="'Internet Gateway, linha ' + at('aws_internet_gateway.main_igw')">
    <rect class="nr fill" x="140" y="128" width="160" height="44" rx="10"/>
    <text class="tt" x="220" y="148" text-anchor="middle">Internet Gateway</text>
    <text class="ts" x="220" y="164" text-anchor="middle">main_igw</text>
  </a>
  <g class="flow"><path d="M220 174V206"/><path class="hd" d="M215 203l5 7 5-7z"/></g>

  <!-- 3 Route table -->
  <a [attr.href]="'#L' + at('aws_route_table.main_route_table')" [attr.aria-label]="'tabela de rotas, linha ' + at('aws_route_table.main_route_table')">
    <rect class="nr fill" x="110" y="212" width="220" height="50" rx="10"/>
    <text class="tt" x="220" y="233" text-anchor="middle">Tabela de rotas</text>
    <text class="ts" x="220" y="250" text-anchor="middle">0.0.0.0/0 → igw</text>
  </a>
  <a [attr.href]="'#L' + at('aws_route_table_association.main_association')" [attr.aria-label]="'Associação da tabela de rotas com a sub-rede, linha ' + at('aws_route_table_association.main_association')">
    <g class="flow"><path d="M220 264V294"/><path class="hd" d="M215 291l5 7 5-7z"/></g>
    <text class="ts dim" x="230" y="284">associação</text>
  </a>

  <!-- 5 Subnet -->
  <a [attr.href]="'#L' + at('aws_subnet.main_subnet')" [attr.aria-label]="'sub-rede pública 10.0.1.0/24, linha ' + at('aws_subnet.main_subnet')">
    <rect class="nr" x="40" y="300" width="360" height="374" rx="12"/>
    <text class="tt" x="56" y="324">Sub-rede pública</text>
    <text class="ts" x="56" y="341">10.0.1.0/24 · us-east-1a</text>
  </a>

  <!-- 6 Security group -->
  <a [attr.href]="'#L' + at('aws_security_group.main_sg')" [attr.aria-label]="'security group, linha ' + at('aws_security_group.main_sg')">
    <rect class="nr sg" x="56" y="356" width="328" height="302" rx="12"/>
    <text class="tt" x="72" y="381">Security group</text>
    <text class="ts" x="196" y="381">main_sg</text>
  </a>
  <a [attr.href]="'#L' + at('aws_security_group.main_sg:ingress')" [attr.aria-label]="'Entrada: SSH na 22 a partir de 203.0.113.0/24, linha ' + at('aws_security_group.main_sg:ingress')">
    <rect class="nr chip" x="72" y="394" width="296" height="28" rx="7"/>
    <text class="ts" x="84" y="412"><tspan class="in">IN </tspan> 22/tcp ← 203.0.113.0/24</text>
  </a>
  <a [attr.href]="'#L' + at('aws_security_group.main_sg:egress')" [attr.aria-label]="'Saída: 80 e 443, linha ' + at('aws_security_group.main_sg:egress')">
    <rect class="nr chip" x="72" y="428" width="296" height="28" rx="7"/>
    <text class="ts" x="84" y="446"><tspan class="out">OUT</tspan> 80, 443/tcp → 0.0.0.0/0</text>
  </a>

  <!-- 7 EC2, 8 Nginx -->
  <a [attr.href]="'#L' + at('aws_instance.debian_ec2')" [attr.aria-label]="'instância EC2 t2.micro com Debian 12, linha ' + at('aws_instance.debian_ec2')">
    <rect class="nr fill" x="72" y="470" width="296" height="174" rx="12"/>
    <text class="tt" x="88" y="496">EC2 · t2.micro</text>
    <text class="ts" x="88" y="514">Debian 12 · IP público</text>
  </a>
  <a [attr.href]="'#L' + at('aws_instance.debian_ec2:user_data')" [attr.aria-label]="'user_data instala o Nginx, linha ' + at('aws_instance.debian_ec2:user_data')">
    <rect class="nr nginx" x="88" y="528" width="264" height="48" rx="8"/>
    <text class="tt" x="104" y="548">Nginx</text>
    <text class="ts" x="104" y="566">user_data · apt + systemctl</text>
  </a>
  <a [attr.href]="'#L' + at('aws_instance.debian_ec2:root_block_device')" [attr.aria-label]="'Disco raiz gp2 de 20 GB, linha ' + at('aws_instance.debian_ec2:root_block_device')">
    <rect class="nr chip" x="88" y="588" width="264" height="40" rx="8"/>
    <text class="ts" x="104" y="612">EBS gp2 · 20 GB · apaga junto</text>
  </a>

  <!-- outside the VPC: 9 key pair, 10 S3, 11 IAM -->
  <text class="ts dim" x="10" y="732">FORA DA VPC</text>
  <g class="flow dash"><path d="M100 742V650"/><path class="hd" d="M95 653l5-7 5 7z"/></g>
  <a [attr.href]="'#L' + at('tls_private_key.ec2_key')" [attr.aria-label]="'par de chaves RSA 2048, linha ' + at('tls_private_key.ec2_key')">
    <rect class="nr fill" x="10" y="744" width="134" height="64" rx="10"/>
    <text class="tt" x="22" y="772">Par de chaves</text>
    <text class="ts" x="22" y="790">tls · RSA 2048</text>
  </a>
  <a [attr.href]="'#L' + at('aws_s3_bucket.backup_bucket')" [attr.aria-label]="'bucket S3 de backup versionado, linha ' + at('aws_s3_bucket.backup_bucket')">
    <rect class="nr fill" x="153" y="744" width="134" height="64" rx="10"/>
    <text class="tt" x="165" y="772">S3 backup</text>
    <text class="ts" x="165" y="790">versionado</text>
  </a>
  <a [attr.href]="'#L' + at('aws_iam_user.terraform_user')" [attr.aria-label]="'usuário e política IAM, linha ' + at('aws_iam_user.terraform_user')">
    <rect class="nr fill" x="296" y="744" width="134" height="64" rx="10"/>
    <text class="tt" x="308" y="772">IAM</text>
    <text class="ts" x="308" y="790">user + policy</text>
  </a>

  <!-- numbered callouts on each box's top-right corner, same numbers as the legend -->
  <g class="calls" aria-hidden="true">
    @for (c of calls; track c[0]) {
      <circle [attr.cx]="c[1]" [attr.cy]="c[2]" r="10"/>
      <text [attr.x]="c[1]" [attr.y]="c[2] + 4" text-anchor="middle">{{ c[0] }}</text>
    }
  </g>
</svg>
  `,
})
export class Diagram {
  protected readonly at = at;
  protected readonly calls: [number, number, number][] = [
    [1, 286, 16], [2, 296, 132], [3, 326, 216], [4, 412, 154], [5, 396, 304], [6, 380, 360],
    [7, 364, 474], [8, 348, 532], [9, 140, 748], [10, 283, 748], [11, 426, 748],
  ];
}
