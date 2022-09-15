import {
  privateSubnet1Cidr,
  privateSubnet2Cidr,
  vpcPrivateSubnetIds,
} from "./VpcResources";

const redisName = process.env.REDIS_NAME!;

const RedisSubnetGroup = {
  Type: "AWS::ElastiCache::SubnetGroup",
  Properties: {
    CacheSubnetGroupName: `${redisName}-subnet-group`,
    Description: "Subnet group for Private subnets in Game VPC",
    SubnetIds: vpcPrivateSubnetIds,
  },
};

const RedisSecurityGroup = {
  Type: "AWS::EC2::SecurityGroup",
  Properties: {
    GroupDescription: `Security group for redis`,
    VpcId: { Ref: "VPC" },
  },
};
const RedisSecurityGroupIngress1 = {
  Type: "AWS::EC2::SecurityGroupIngress",
  Properties: {
    GroupId: { Ref: "RedisSecurityGroup" },
    IpProtocol: "TCP",
    FromPort: 6379,
    ToPort: 6379,
    CidrIp: privateSubnet1Cidr,
  },
};
const RedisSecurityGroupIngress2 = {
  Type: "AWS::EC2::SecurityGroupIngress",
  Properties: {
    GroupId: { Ref: "RedisSecurityGroup" },
    IpProtocol: "TCP",
    FromPort: 6379,
    ToPort: 6379,
    CidrIp: privateSubnet2Cidr,
  },
};

const Redis = {
  Type: "AWS::ElastiCache::ReplicationGroup",
  Properties: {
    ReplicationGroupId: redisName,
    ReplicationGroupDescription: "Redis instance for Game service",
    CacheNodeType: "cache.t3.micro",
    Engine: "redis",
    ReplicasPerNodeGroup: 0,
    AutomaticFailoverEnabled: false,
    CacheSubnetGroupName: { Ref: "RedisSubnetGroup" },
    SecurityGroupIds: [{ Ref: "RedisSecurityGroup" }],
  },
};

const RedisResources = {
  RedisSubnetGroup,
  RedisSecurityGroup,
  RedisSecurityGroupIngress1,
  RedisSecurityGroupIngress2,
  Redis,
};
export default RedisResources;

export const RedisHost = {
  "Fn::GetAtt": ["Redis", "PrimaryEndPoint.Address"],
};
