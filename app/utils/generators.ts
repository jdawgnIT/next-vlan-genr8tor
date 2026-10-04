// app/utils/generators.ts

export interface GlobalSettings {
  nativeVlan: string;
  managementVlan: string;
  managementSwitchPort: string;
  pfsensePorts: string;
  accessPointPorts: string;
  interSwitchPorts: string;
  pfsenseParentInterface: string;
}

export interface VlanProfile {
  id: string;
  name: string;
  purpose: string;
  subnet: string;
  routerIp: string;
  switchIp: string;
  apIp: string;
  isWireless: boolean;
  isHostile: boolean;
  ssid: string;
}

export const generateCiscoSwitch = (
  vlans: VlanProfile[],
  globalSettings: GlobalSettings
): string => {
  let conf = `! --- CISCO IOS SWITCH CONFIGURATION ---\n`;
  conf += `! Targets Catalyst 3850 Multilayer Platform\n`;
  conf += `vlan dot1q tag native\n!\n`;

  vlans.forEach((v) => {
    conf += `vlan ${v.id}\n name ${v.name}\n`;
  });

  conf += `!\n! Management SVI (Static Wired Access Only)\n`;
  const mgmt = vlans.find((v) => v.id === globalSettings.managementVlan);
  if (mgmt) {
    conf += `interface Vlan${mgmt.id}\n description Management_Interface\n ip address ${mgmt.switchIp} 255.255.255.0\n no shut\n!\n`;
  }

  conf += `! Physical Port to Management Device Access\n`;
  conf += `interface ${globalSettings.managementSwitchPort}\n description Wired_Admin_Access_Port\n switchport mode access\n switchport access vlan ${globalSettings.managementVlan}\n spanning-tree portfast\n!\n`;

  globalSettings.pfsensePorts
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((port) => {
      conf += `! Trunk Port to pfSense Router\ninterface ${port}\n description Trunk_to_pfSense\n switchport trunk native vlan ${globalSettings.nativeVlan}\n switchport mode trunk\n!\n`;
    });

  globalSettings.accessPointPorts
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((port) => {
      conf += `! Trunk Port to Autonomous AP\ninterface ${port}\n description Trunk_to_Autonomous_AP\n switchport trunk native vlan ${globalSettings.nativeVlan}\n switchport mode trunk\n!\n`;
    });

  globalSettings.interSwitchPorts
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((port) => {
      conf += `! Trunk Inter-Switch Cross-Connect link\ninterface ${port}\n description ISL_Trunk_Link\n switchport trunk native vlan ${globalSettings.nativeVlan}\n switchport mode trunk\n channel-group 1 mode active\n!\n`;
    });

  return conf;
};

export const generateCiscoAP = (vlans: VlanProfile[], globalSettings: GlobalSettings): string => {
  let conf = `! --- CISCO AUTONOMOUS AP CONFIGURATION ---\n`;
  conf += `! Targets Aironet 3502 Autonomous Platform\n`;
  conf += `no vlan dot1q tag native\n!\n`;

  const mgmtVlan = globalSettings.managementVlan;
  const nativeVlan = globalSettings.nativeVlan;
  const mgmt = vlans.find((v) => v.id === mgmtVlan);
  const wirelessVlans = vlans.filter((v) => v.isWireless);

  wirelessVlans.forEach((v) => {
    conf += `dot11 ssid ${v.ssid}\n   vlan ${v.id}\n   authentication open\n   authentication key-management wpa version 2\n   wpa-psk ascii YourSecurePassphrase\n`;
    if (v.isHostile) {
      conf += `   station-role root public-secure-packet\n!\n`;
    } else {
      conf += `   station-role root\n!\n`;
    }
  });

  if (mgmt) {
    conf += `! Management Interface BVI\n`;
    conf += `interface BVI1\n ip address ${mgmt.apIp} 255.255.255.0\n no shut\n!\n`;
  }

  conf += `! Physical Ethernet Main Interface\ninterface GigabitEthernet0\n no ip address\n no shut\n!\n`;

  conf += `interface GigabitEthernet0.${nativeVlan}\n encapsulation dot1Q ${nativeVlan} native\n`;
  if (nativeVlan === mgmtVlan) {
    conf += ` bridge-group 1\n!\n`;
  } else {
    conf += ` bridge-group 99\n!\n`;
  }

  vlans.forEach((v) => {
    if (v.id !== nativeVlan) {
      conf += `interface GigabitEthernet0.${v.id}\n encapsulation dot1Q ${v.id}\n`;
      if (v.id === mgmtVlan) {
        conf += ` bridge-group 1\n!\n`;
      } else {
        conf += ` bridge-group ${v.id}\n!\n`;
      }
    }
  });

  const radios = ["Dot11Radio0", "Dot11Radio1"];
  radios.forEach((radioName) => {
    conf += `! --- ${radioName} Configuration ---\ninterface ${radioName}\n no ip address\n`;
    wirelessVlans.forEach((v) => {
      conf += ` encryption vlan ${v.id} mode ciphers aes-ccm\n`;
    });
    wirelessVlans.forEach((v) => {
      conf += ` ssid ${v.ssid}\n`;
    });
    conf += ` station-role root\n no shut\n!\n`;

    conf += `interface ${radioName}.${nativeVlan}\n encapsulation dot1Q ${nativeVlan} native\n`;
    if (nativeVlan === mgmtVlan) {
      conf += ` bridge-group 1\n!\n`;
    } else {
      conf += ` bridge-group 99\n!\n`;
    }

    wirelessVlans.forEach((v) => {
      if (v.id !== nativeVlan) {
        conf += `interface ${radioName}.${v.id}\n encapsulation dot1Q ${v.id}\n`;
        if (v.id === mgmtVlan) {
          conf += ` bridge-group 1\n`;
        } else {
          conf += ` bridge-group ${v.id}\n`;
        }
        if (v.isHostile) conf += ` subscriber-loop-control\n`;
        conf += `!\n`;
      }
    });
  });

  conf += `! Global Bridge Settings\nbridge 1 routing ip\n`;
  return conf;
};

export const generatePfSense = (vlans: VlanProfile[], globalSettings: GlobalSettings): string => {
  let xml = "<!-- pfSense Dynamic Configurations Fragment for /conf/config.xml -->\n\n";
  const parentIf = globalSettings.pfsenseParentInterface;

  xml += "<!-- Core VLAN Trunk Profiles -->\n<vlans>\n";
  vlans.forEach((v) => {
    xml +=
      "  <vlan>\n    <if>" +
      parentIf +
      "</if>\n    <tag>" +
      v.id +
      "</tag>\n    <descr><![CDATA[" +
      v.name +
      "]]></descr>\n  </vlan>\n";
  });
  xml += "</vlans>\n\n";

  xml += "<!-- Logical Mappings (Insert inside global <interfaces> tag) -->\n<interfaces>\n";
  vlans.forEach((v) => {
    xml +=
      "  <opt" +
      v.id +
      ">\n    <enable></enable>\n    <if>" +
      parentIf +
      "_vlan" +
      v.id +
      "</if>\n    <descr><![CDATA[" +
      v.name +
      "]]></descr>\n    <ipaddr>" +
      v.routerIp +
      "</ipaddr>\n    <subnet>24</subnet>\n    <spoofmac></spoofmac>\n  </opt" +
      v.id +
      ">\n";
  });
  xml += "</interfaces>\n\n";

  xml += "<!-- DHCP Server Pools (Insert into global <dhcpd> node) -->\n<dhcpd>\n";
  vlans.forEach((v) => {
    const baseIp = v.routerIp.substring(0, v.routerIp.lastIndexOf("."));
    const dnsPrimary = v.id === globalSettings.managementVlan ? "1.1.1.1" : "9.9.9.9";
    const poolStart = "100";
    const poolEnd = "250";

    xml +=
      "  <opt" +
      v.id +
      ">\n    <enable></enable>\n    <range>\n      <from>" +
      baseIp +
      "." +
      poolStart +
      "</from>\n      <to>" +
      baseIp +
      "." +
      poolEnd +
      "</to>\n    </range>\n    <gateway>" +
      v.routerIp +
      "</gateway>\n    <dnsserver>" +
      dnsPrimary +
      "</dnsserver>\n    <defaultleasetime>7200</defaultleasetime>\n    <maxleasetime>86400</maxleasetime>\n    <netmask>24</netmask>\n  </opt" +
      v.id +
      ">\n";
  });
  xml += "</dhcpd>\n\n";

  xml += "<!-- Core Firewall Blocks (Insert into global <filter> node) -->\n<filter>\n";
  const mgmt = vlans.find((v) => v.id === globalSettings.managementVlan);
  const mgmtSubnet = mgmt ? mgmt.subnet.split("/") : "10.10.10.0";
  const mgmtMask = mgmt ? mgmt.subnet.split("/") : "24";

  vlans
    .filter((v) => v.isHostile)
    .forEach((v, index) => {
      const interfaceLabel = "opt" + v.id;
      const trackerA = 1600000000 + parseInt(v.id) + index;
      const trackerB = 1700000000 + parseInt(v.id) + index;
      const trackerC = 1800000000 + parseInt(v.id) + index;

      xml +=
        "  <rule>\n    <id></id>\n    <tracker>" +
        trackerA +
        "</tracker>\n    <type>block</type>\n    <interface>" +
        interfaceLabel +
        "</interface>\n    <ipprotocol>inet</ipprotocol>\n    <protocol>any</protocol>\n    <source>\n      <network>" +
        interfaceLabel +
        "net</network>\n    </source>\n    <destination>\n      <address>" +
        mgmtSubnet +
        "/" +
        mgmtMask +
        "</address>\n    </destination>\n    <descr><![CDATA[Isolate " +
        v.name +
        " from Management Network Layer]]></descr>\n  </rule>\n";
      xml +=
        "  <rule>\n    <id></id>\n    <tracker>" +
        trackerB +
        "</tracker>\n    <type>block</type>\n    <interface>" +
        interfaceLabel +
        "</interface>\n    <ipprotocol>inet</ipprotocol>\n    <protocol>any</protocol>\n    <source>\n      <network>" +
        interfaceLabel +
        "net</network>\n    </source>\n    <destination>\n      <address>10.0.0.0/8</address>\n    </destination>\n    <descr><![CDATA[Drop Inter-VLAN corporate hops from " +
        v.name +
        "]]></descr>\n  </rule>\n";
      xml +=
        "  <rule>\n    <id></id>\n    <tracker>" +
        trackerC +
        "</tracker>\n    <type>pass</type>\n    <interface>" +
        interfaceLabel +
        "</interface>\n    <ipprotocol>inet</ipprotocol>\n    <protocol>any</protocol>\n    <source>\n      <network>" +
        interfaceLabel +
        "net</network>\n    </source>\n    <destination>\n      <any></any>\n    </destination>\n    <descr><![CDATA[Permit Outbound WAN Internet for " +
        v.name +
        "]]></descr>\n  </rule>\n";
    });

  xml += "</filter>\n";
  return xml;
};

export const generateMarkdownExplanation = (
  vlans: VlanProfile[],
  globalSettings: GlobalSettings
): string => {
  let md = "# Dynamic Network Infrastructure Configuration Guide\n";
  md +=
    "Generated configuration blueprints targeting a **Cisco Catalyst 3850 Switch**, a **Cisco Aironet 3502 Autonomous AP**, and a **pfSense Core Firewall Router**.\n\n";
  md += "## 🛠️ Feature Matrix & Architecture Explanations\n\n";
  md += "### 1. Hardened Core Native VLAN Design (`vlan dot1q tag native`)\n";
  md +=
    "* **Catalyst Switch Environment:** Forcing native tags strips standard untagged spoofing capabilities across trunks by explicitly injecting headers onto packets targeting VLAN " +
    globalSettings.nativeVlan +
    ".\n";
  md +=
    "* **Autonomous AP Bridge Workaround (`no vlan dot1q tag native`):** Autonomous access points use an inner hardware bridge kernel. Forcing the AP to receive tagged frames on its initial entry port locks the management interface out of `BVI1`. The Switch tags it outwards; the AP unpacks it natively inside `bridge-group 1`.\n\n";
  md += "### 2. Multi-Port Distributed Interface Matrix\n";
  md +=
    "The underlying switch landscape maps structural port targets seamlessly across dynamic trunk layouts:\n";
  md += "* pfSense Aggregation Ports: Active handoffs via: " + globalSettings.pfsensePorts + "\n";
  md +=
    "* Autonomous Access Points: Active wireless trunks: " + globalSettings.accessPointPorts + "\n";
  md +=
    "* Downstream Backbone Interconnects (ISL): Cross-links: " +
    globalSettings.interSwitchPorts +
    " bundled with LACP channel assemblies.\n\n";
  md += "### 3. Rogue Wireless Segment Containment (Hostile Networks)\n";
  md += "Wireless lines marked as untrusted or hostile invoke a multi-tier lockdown methodology:\n";
  md +=
    "* Public Secure Packet Forwarding (PSPF): Enforced using public-secure-packet at the SSID tier to execute full Layer 2 client isolation inside the radio cell.\n";
  md +=
    "* Subscriber Loop Control: Restricts interface loop vulnerabilities across virtual radio paths.\n";
  md +=
    "* pfSense Router Policy Hardening: Native XML filter blocks drop transit traffic trying to access your administrative workspace (" +
    globalSettings.managementVlan +
    ") or internal subnets, while allowing standard outbound WAN routing.\n";
  return md;
};
// app/utils/generators.ts - FIXED generateMermaid Function

export const generateMermaid = (vlans: VlanProfile[], globalSettings: GlobalSettings): string => {
  let diagram = "graph TD\n  Internet((WAN / Internet)) --> pfSense[pfSense Router]\n";
  diagram +=
    '  pfSense -->|"Trunk Interface: ' +
    globalSettings.pfsenseParentInterface +
    '"| Switch[Cisco Switch]\n';

  const mgmt = vlans.find((v) => v.id === globalSettings.managementVlan);
  if (mgmt) {
    diagram +=
      '  Switch -->|"Access Port: VLAN ' + mgmt.id + '"| Admin[Admin PC / Wired Management Only]\n';
  }

  diagram += '  Switch -->|"Active Wireless Trunks"| AP[Aironet 3502 Autonomous AP]\n';
  diagram +=
    "  subgraph AP_Radios [Dual-Band Array]\n    AP --> Rad0[Dot11Radio0: 2.4 GHz]\n    AP --> Rad1[Dot11Radio1: 5.0 GHz]\n  end\n";

  vlans
    .filter((v) => v.isWireless)
    .forEach((v) => {
      const pspFlag = v.isHostile ? " (PSP Client Isolated)" : "";
      // Enclosing the entire string mapping payload inside explicit double-quotes protects the parse tree
      diagram +=
        '  Rad0 -.->|"SSID: ' +
        v.ssid +
        pspFlag +
        '"| Client_24_' +
        v.id +
        "[2.4G Client on " +
        v.name +
        "]\n";
      diagram +=
        '  Rad1 -.->|"SSID: ' +
        v.ssid +
        pspFlag +
        '"| Client_50_' +
        v.id +
        "[5G Client on " +
        v.name +
        "]\n";

      if (v.isHostile) {
        diagram +=
          "  style Client_24_" +
          v.id +
          " fill:#4a154b,stroke:#e01e5a,stroke-width:2px,color:#fff\n";
        diagram +=
          "  style Client_50_" +
          v.id +
          " fill:#4a154b,stroke:#e01e5a,stroke-width:2px,color:#fff\n";
      } else {
        diagram +=
          "  style Client_24_" +
          v.id +
          " fill:#1d3557,stroke:#457b9d,stroke-width:1px,color:#fff\n";
        diagram +=
          "  style Client_50_" +
          v.id +
          " fill:#1d3557,stroke:#457b9d,stroke-width:1px,color:#fff\n";
      }
    });

  return diagram;
};
