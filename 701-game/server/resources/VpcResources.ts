const vpcName = process.env.VPC_NAME!;
const vpcCidr = process.env.VPC_CIDR!;

const publicSubnet1Cidr = process.env.PUBLIC_SUBNET1_CIDR;
export const privateSubnet1Cidr = process.env.PRIVATE_SUBNET1_CIDR;

const publicSubnet2Cidr = process.env.PUBLIC_SUBNET2_CIDR;
export const privateSubnet2Cidr = process.env.PRIVATE_SUBNET2_CIDR;

const VPC = {
  Type: "AWS::EC2::VPC",
  Properties: {
    CidrBlock: vpcCidr,
    EnableDnsSupport: true,
    EnableDnsHostnames: true,
    Tags: [{ Key: "Name", Value: vpcName }],
  },
};
const PublicSubnet1 = {
  Type: "AWS::EC2::Subnet",
  Properties: {
    VpcId: { Ref: "VPC" },
    AvailabilityZone: { "Fn::Select": [0, { "Fn::GetAZs": "" }] },
    CidrBlock: publicSubnet1Cidr,
    MapPublicIpOnLaunch: true,
    Tags: [{ Key: "Name", Value: `${vpcName} Public Subnet (AZ1)` }],
  },
};
const PrivateSubnet1 = {
  Type: "AWS::EC2::Subnet",
  Properties: {
    VpcId: { Ref: "VPC" },
    AvailabilityZone: { "Fn::Select": [0, { "Fn::GetAZs": "" }] },
    CidrBlock: privateSubnet1Cidr,
    MapPublicIpOnLaunch: false,
    Tags: [{ Key: "Name", Value: `${vpcName} Private Subnet (AZ1)` }],
  },
};
const PublicSubnet2 = {
  Type: "AWS::EC2::Subnet",
  Properties: {
    VpcId: { Ref: "VPC" },
    AvailabilityZone: { "Fn::Select": [1, { "Fn::GetAZs": "" }] },
    CidrBlock: publicSubnet2Cidr,
    MapPublicIpOnLaunch: true,
    Tags: [{ Key: "Name", Value: `${vpcName} Public Subnet (AZ2)` }],
  },
};
const PrivateSubnet2 = {
  Type: "AWS::EC2::Subnet",
  Properties: {
    VpcId: { Ref: "VPC" },
    AvailabilityZone: { "Fn::Select": [1, { "Fn::GetAZs": "" }] },
    CidrBlock: privateSubnet2Cidr,
    MapPublicIpOnLaunch: false,
    Tags: [{ Key: "Name", Value: `${vpcName} Private Subnet (AZ2)` }],
  },
};

const InternetGateway = {
  Type: "AWS::EC2::InternetGateway",
};
const InternetGatewayAttachment = {
  Type: "AWS::EC2::VPCGatewayAttachment",
  Properties: {
    InternetGatewayId: { Ref: "InternetGateway" },
    VpcId: { Ref: "VPC" },
  },
};
const PublicRouteTable = {
  Type: "AWS::EC2::RouteTable",
  Properties: {
    VpcId: { Ref: "VPC" },
    Tags: [{ Key: "Name", Value: `${vpcName} Public routes` }],
  },
};
const DefaultPublicRoute = {
  Type: "AWS::EC2::Route",
  DependsOn: ["InternetGatewayAttachment"],
  Properties: {
    RouteTableId: { Ref: "PublicRouteTable" },
    DestinationCidrBlock: "0.0.0.0/0",
    GatewayId: { Ref: "InternetGateway" },
  },
};

const PublicSubnet1RouteTableAssociation = {
  Type: "AWS::EC2::SubnetRouteTableAssociation",
  Properties: {
    RouteTableId: { Ref: "PublicRouteTable" },
    SubnetId: { Ref: "PublicSubnet1" },
  },
};
const PublicSubnet2RouteTableAssociation = {
  Type: "AWS::EC2::SubnetRouteTableAssociation",
  Properties: {
    RouteTableId: { Ref: "PublicRouteTable" },
    SubnetId: { Ref: "PublicSubnet2" },
  },
};

const NatGateway1EIP = {
  Type: "AWS::EC2::EIP",
  DependsOn: ["InternetGatewayAttachment"],
  Properties: {
    Domain: "vpc",
  },
};
const NatGateway1 = {
  Type: "AWS::EC2::NatGateway",
  Properties: {
    AllocationId: { "Fn::GetAtt": ["NatGateway1EIP", "AllocationId"] },
    SubnetId: { Ref: "PublicSubnet1" },
  },
};
const PrivateRouteTable1 = {
  Type: "AWS::EC2::RouteTable",
  Properties: {
    VpcId: { Ref: "VPC" },
    Tags: [{ Key: "Name", Value: `${vpcName} Private routes (AZ1)` }],
  },
};
const DefaultPrivateRoute1 = {
  Type: "AWS::EC2::Route",
  Properties: {
    RouteTableId: { Ref: "PrivateRouteTable1" },
    DestinationCidrBlock: "0.0.0.0/0",
    NatGatewayId: { Ref: "NatGateway1" },
  },
};
const PrivateSubnet1RouteTableAssociation = {
  Type: "AWS::EC2::SubnetRouteTableAssociation",
  Properties: {
    RouteTableId: { Ref: "PrivateRouteTable1" },
    SubnetId: { Ref: "PrivateSubnet1" },
  },
};

const NatGateway2EIP = {
  Type: "AWS::EC2::EIP",
  DependsOn: ["InternetGatewayAttachment"],
  Properties: {
    Domain: "vpc",
  },
};
const NatGateway2 = {
  Type: "AWS::EC2::NatGateway",
  Properties: {
    AllocationId: { "Fn::GetAtt": ["NatGateway2EIP", "AllocationId"] },
    SubnetId: { Ref: "PublicSubnet2" },
  },
};
const PrivateRouteTable2 = {
  Type: "AWS::EC2::RouteTable",
  Properties: {
    VpcId: { Ref: "VPC" },
    Tags: [{ Key: "Name", Value: `${vpcName} Private routes (AZ2)` }],
  },
};
const DefaultPrivateRoute2 = {
  Type: "AWS::EC2::Route",
  Properties: {
    RouteTableId: { Ref: "PrivateRouteTable2" },
    DestinationCidrBlock: "0.0.0.0/0",
    NatGatewayId: { Ref: "NatGateway2" },
  },
};
const PrivateSubnet2RouteTableAssociation = {
  Type: "AWS::EC2::SubnetRouteTableAssociation",
  Properties: {
    RouteTableId: { Ref: "PrivateRouteTable2" },
    SubnetId: { Ref: "PrivateSubnet2" },
  },
};

const DefaultVpcSecurityGroup = {
  Type: "AWS::EC2::SecurityGroup",
  Properties: {
    GroupDescription: `Security group for ${vpcName}`,
    VpcId: { Ref: "VPC" },
  },
};

const VpcResources = {
  VPC,
  PublicSubnet1,
  PrivateSubnet1,
  PublicSubnet2,
  PrivateSubnet2,

  PublicRouteTable,
  InternetGateway,
  InternetGatewayAttachment,
  DefaultPublicRoute,

  PublicSubnet1RouteTableAssociation,
  PublicSubnet2RouteTableAssociation,

  NatGateway1EIP,
  NatGateway1,
  PrivateRouteTable1,
  DefaultPrivateRoute1,
  PrivateSubnet1RouteTableAssociation,

  NatGateway2EIP,
  NatGateway2,
  PrivateRouteTable2,
  DefaultPrivateRoute2,
  PrivateSubnet2RouteTableAssociation,

  DefaultVpcSecurityGroup,
};

export default VpcResources;

export const vpcPrivateSubnetIds = [
  { Ref: "PrivateSubnet1" },
  { Ref: "PrivateSubnet2" },
];
export const vpcSecurityGroupIds = [{ Ref: "DefaultVpcSecurityGroup" }];
