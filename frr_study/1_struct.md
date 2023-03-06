
```
1_struct.md
:Author: kalipy
:Email: kalipy@debian
```

### struct interface

```
/* Interface structure */
struct interface {
	//将接口按名称和索引分别保存在两个红黑树(rb tree)中
	RB_ENTRY(interface) name_entry, index_entry;

	/* Interface name.  This should probably never be changed after the
	   interface is created, because the configuration info for this
	   interface
	   is associated with this structure.  For that reason, the interface
	   should also never be deleted (to avoid losing configuration info).
	   To delete, just set ifindex to IFINDEX_INTERNAL to indicate that the
	   interface does not exist in the kernel.
	 */
	char name[INTERFACE_NAMSIZ];

	/* Interface index (should be IFINDEX_INTERNAL for non-kernel or
	   deleted interfaces).
	   WARNING: the ifindex needs to be changed using the if_set_index()
	   function. Failure to respect this will cause corruption in the data
	   structure used to store the interfaces and if_lookup_by_index() will
	   not work as expected.
	 */
	ifindex_t ifindex;//接口在内核中的索引号，应该通过if_set_index()函数来设置，否则会导致数据结构中的不一致性
	ifindex_t oldifindex;//用于保存旧的接口索引号，当接口索引号更改时会用到

	/*
	 * ifindex of parent interface, if any
	 */
	ifindex_t link_ifindex;//若该接口为一个子接口，则此字段保存其上一级接口的索引号
#define IFINDEX_INTERNAL	0

	/* Zebra internal interface status */
	uint8_t status;
//表示接口的活动状态，即该接口已经启用并可以进行发送和接收数据包
#define ZEBRA_INTERFACE_ACTIVE     (1 << 0)
//表示该接口是一个子接口，通常用于将物理接口划分为更小的逻辑接口，例如VLAN
#define ZEBRA_INTERFACE_SUB        (1 << 1)
//表示已检测到接口的物理连通性
#define ZEBRA_INTERFACE_LINKDETECTION (1 << 2)
//表示该接口是VRF（虚拟路由表）中的回环接口，用于在虚拟网络中模拟IP回路
#define ZEBRA_INTERFACE_VRF_LOOPBACK (1 << 3)

	/* Interface flags. */
	uint64_t flags;//flags标志通常用于设置和描述网络接口的属性和状态
    /*
    IFF_UP:

该标志表示接口处于激活状态，即启用状态。如果该标志没有设置，则该接口被认为是关闭状态，无法进行发送和接收数据包。

    IFF_BROADCAST:

该标志表示该接口支持广播传输，即可以将数据包广播到网络上的所有设备，而非只是发送给特定的设备。此标志通常用于广播和组播通信。

    IFF_RUNNING:

该标志表示该接口已经运行，即已经处于发送和接收数据包的状态。当该标志被置位时，表示该接口可以正常工作，数据包可以在该接口上传输。如果没有设置该标志，则该接口处于非激活或未启用状态。

    IFF_LOOPBACK:

该标志表示该接口是回环接口，可以用于本地环回测试。回环接口是一个虚拟接口，可以将数据包发送回其自己的接口，以便进行本地测试。

    IFF_NOARP:

该标志表示该接口不支持ARP（地址解析协议）。ARP是一个广泛使用的协议，用于将IP地址转换为MAC地址。如果该标志被设置，表示该接口上的数据包将不使用ARP进行地址解析。

    IFF_PROMISC:

该标志表示该接口被设置为混杂模式，可以接收所有经过该接口的数据包，而非只接收自己的地址。混杂模式通常用于网络分析和嗅探，在捕获网络数据包时非常有用。

操作这些flag的宏，作者定义如下：
#define CHECK_FLAG(V,F)      ((V) & (F))
#define SET_FLAG(V,F)        (V) |= (F)
#define UNSET_FLAG(V,F)      (V) &= ~(F)
#define RESET_FLAG(V)        (V) = 0
#define COND_FLAG(V, F, C)   ((C) ? (SET_FLAG(V, F)) : (UNSET_FLAG(V, F)))
    */

	/* Interface metric */
	uint32_t metric;//接口的路由度量(距离)，用于计算路径开销

	/* Interface Speed in Mb/s */
	uint32_t speed;//接口的速度，单位是 Mb/s（兆比特每秒）

	/* Interface MTU. */
	unsigned int mtu; /* IPv4 MTU */
	unsigned int
		mtu6; /* IPv6 MTU - probably, but not necessarily same as mtu
		       */

	/* Link-layer information and hardware address */
    //接口的链路类型，可能的取值包括 Ethernet、Point-to-Point、PPP、Frame Relay等等
	enum zebra_link_type ll_type;
    //接口的 MAC 地址
	uint8_t hw_addr[INTERFACE_HWADDR_MAX];
    //MAC 地址的长度，单位是字节
	int hw_addr_len;

	/* interface bandwidth, kbits */
    //带宽，单位是千位每秒（Kb/s）
	unsigned int bandwidth;
    /*
    接口带宽和接口速度的区别：
        接口的带宽（Bandwidth）是指在一个特定时间内接口所能传输的最大数据量，通常以单位时间内传输的数据量（比特/秒）来表示。例如，一个接口的带宽为100Mbps，表示该接口可以在1秒钟内传输100兆比特的数据量。在网络设计和规划中，带宽是一个非常重要的指标，可以用于评估网络的性能和容量。
        
        接口的速度（Speed）则是指接口实际发送和接收数据的时间，是实际数据传输速度的指标。例如，一个接口的速度为10Gbps，表示该接口可以在1秒钟内实际传输10千兆比特的数据量。接口的速度通常根据连接的实际物理链路和设备或媒体的实际能力来计算。
        
        虽然带宽和速度都是衡量网络性能的重要指标，但是它们之间还有很大的区别。一个接口的带宽可能大于或小于实际的数据传输速度，因为实际的数据传输速度还会受到其他因素的影响，如传输介质、数据流量、数据的优先级等
    */

	/* Link parameters for Traffic Engineering */
    //与此接口相关的链路参数，这些参数可以用于评估接口连接的网络质量，对于Traffic Engineering（TE）网络特别重要。根据这些参数，可以有效地管理网络带宽，优化网络性能和资源利用率，提高数据传输效率
	struct if_link_params *link_params;
    /*
    /* Link Parameters for Traffic Engineering
     * Do not forget to update if_link_params_copy()
     * and if_link_params_cmp() when updating the structure
     */
    struct if_link_params {
        //该字段表示链路参数的状态信息，用于记录链路的各种状态。比如，记录链路是否处于激活状态、链路是否连接、链路是否发生故障等状态
    	uint32_t lp_status; /* Status of Link Parameters: */
        //该字段表示Traffic Engineering（TE）指标。在TE网络中，根据网络的情况和需求，可以定义一些指标来优化网络性能。这些指标的具体定义和计算方式可能因网络的特点而异。TE指标可能关注网络的实时因素，如路由路径延迟、带宽利用率等
    	uint32_t te_metric; /* Traffic Engineering metric */
        //该字段表示接口的默认带宽。当没有其他限制时，数据包可以沿着该接口以该默认带宽传输。例如，如果接口的最大带宽为100Mbps，但数据包没有指定其他带宽限制，则数据包可以沿着该接口的默认带宽传输
    	float default_bw;
        //该字段表示接口的最大带宽。接口无法超过此带宽传输数据包。如果数据包的带宽大于接口的最大带宽，则数据包可能会被拒绝，或者被强制降低带宽
    	float max_bw;			/* Maximum Bandwidth */
        //该字段表示接口的最大可预留带宽，即预留带宽的最大值。如果带宽请求超过了可预留带宽（或未定义可预留带宽），则请求可能被拒绝
    	float max_rsv_bw;		/* Maximum Reservable Bandwidth */
        //该字段表示按不同类别类型划分的未预留带宽，共8种类型。每种类型的预留带宽可能不同，具体取决于网络类型和实际需要。例如，某类型的数据包可以使用的未预留带宽可能比其他类型的数据包少
    	float unrsv_bw[MAX_CLASS_TYPE]; /* Unreserved Bandwidth per Class Type
    					   (8) */
        //该字段表示RFC 5305/RFC 5329中定义的管理员组信息，用于标识接口连接的网络区域。这些信息可以用于管理和控制网络资源，以提高网络性能
    	uint32_t admin_grp; /* RFC5305/RFC5329 Administrative group */
        //该字段表示RFC 7308中扩展的管理员组信息。与RFC 5305/RFC 5329中定义的管理员组不同的是，这些信息可能涵盖更多的网络信息和管理标准，具体视网络类型而定
    	struct admin_group ext_admin_grp; /* RFC7308 Extended Admin group */
        //该字段表示远程AS号（Autonomous System Number），用于标识连接到该接口的外部自治系统。在Internet中，自治系统是一些互联的IP网络的集合，自治系统间通过BGP协议进行连接和通信。因此，连接到AS的接口需要记录远程AS号，以便进行路由计算和管理
    	uint32_t rmt_as;		/* Remote AS number */
        //该字段表示远程IP地址，表示连接到该接口的对端IP地址。对于TCP/IP协议族而言，IP地址是通信的基础，因此，记录远程IP地址非常重要
    	struct in_addr rmt_ip;		/* Remote IP address */
        //该字段表示链路的平均延迟，即数据包从发送端到接收端所需的平均时间。延迟是网络性能的重要指标，可以用于估算网络的质量和性能水平
    	uint32_t av_delay;		/* Link Average Delay */
        //该字段表示链路的最小延迟，即数据包从发送端到接收端所需的最小时间
    	uint32_t min_delay;		/* Link Min Delay */
        //该字段表示链路的最大延迟，即数据包从发送端到接收端所需的最大时间
    	uint32_t max_delay;		/* Link Max Delay */
        //该字段表示延迟变化率，即数据包延迟的变化情况。可用于评估网络质量和性能的稳定性
    	uint32_t delay_var;		/* Link Delay Variation */
        //该字段表示链路数据包丢失率，即在传输数据包时丢失的数据包的比例。数据包丢失率是网络质量和可靠性的重要指标，可用于估算网络的性能和健康状况
    	float pkt_loss;			/* Link Packet Loss */
        //该字段表示链路的剩余带宽，即链路当前可用的未使用的带宽
    	float res_bw;			/* Residual Bandwidth */
        //该字段表示接口的可用带宽，即接口可用于数据传输的带宽。可用带宽可能因网络负载、拥塞或其他因素而变化
    	float ava_bw;			/* Available Bandwidth */
        //该字段表示接口已用带宽，即接口当前正在使用的带宽
    	float use_bw;			/* Utilized Bandwidth */
    };
    */

	/* description of the interface. */
	char *desc;

	/* Distribute list. */
	void *distribute_in;
	void *distribute_out;
    /*
    在计算机网络软件中，distribute_in和distribute_out通常用于描述应该如何处理接收到的网络数据包和如何将数据包发出去，从而控制网络的数据流动。
    
    distribute_in是一个指向投递入队列的指针，表示接收到的网络数据包应该由哪个队列进行处理。通过将数据包投递到适当的队列，软件可以确保数据包按照其目标地址或某个其他规则进行处理。
    
    distribute_out是一个指向投递出队列的指针，表示要发出的网络数据包应该由哪个队列进行排队。通过将数据包放入适当的出队列，软件可以更好地控制数据包的发送顺序和速率，以及避免网络拥塞或其他问题。
    
    总的来说，distribute_in和distribute_out这两个字段是用来控制网络数据流动的，可以根据实际应用场景进行配置和优化，以便更好地管理网络性能和资源利用率
    */

	/* Connected address list. */
    //接口上连接的地址列表
	struct list *connected;

	/* Neighbor connected address list. */
    //另一端路由器连接的地址列表
	struct list *nbr_connected;

    /* connected和nbr_connected:
    在计算机网络软件中，connected和nbr_connected是两个用于管理网络地址的列表，它们通常与网络接口或路由器等设备相关联。
    
    connected列表包含与设备直接连接的网络地址，例如设备分配的IP地址、子网掩码、网关地址等，这些地址可用于与其他设备进行通信。此列表通常用于路由选择或数据包转发等网络操作。
    
    nbr_connected列表包含与设备在同一子网或直接连接的设备的网络地址，例如邻居设备的MAC地址、IP地址等。该列表可以从网络接口中提取这些信息，以便更好地管理网络拓扑和性能。
    
    这两个列表通常通过记录IP和MAC地址等数据，实现与其他设备进行通信或路由操作的功能。在实际使用中，这些列表可能会频繁更新和修改，以便更好地管理网络拓扑和性能。
    
    总的来说，connected和nbr_connected这两个字段是用于存储关于网络地址的信息列表，用于网络路由操作和控制。
    */

	/* Daemon specific interface data pointer. */
	void *info;

    //是否启用 PTM（Partial Traffic Model）功能
	char ptm_enable; /* Should we look at ptm_status ? */
    /*
    ptm_enable和ptm_status是用于控制和管理PTM（Partial Traffic Matrix，部分流量矩阵）的标识符和状态。
    
    在计算机网络中，PTM是一种用于测量和分析部分网络流量的技术。这可以帮助网络管理人员更好地了解网络的负载、计量和管理。ptm_enable是一个用于控制PTM的标识符，如果该字段被设置，则表示PTM功能已启用，可以在网络传输中测量部分流量。如果该字段未设置，则表示PTM功能未启用
    */
    //PTM状态
	char ptm_status;

/* Statistics fileds. */
#ifdef HAVE_PROC_NET_DEV
	struct if_stats stats;
#endif /* HAVE_PROC_NET_DEV */
#ifdef HAVE_NET_RT_IFLIST
	struct if_data stats;
#endif /* HAVE_NET_RT_IFLIST */
/*
接口的统计信息，包括接收和发送的数据包数量、错误包数量、请求数量等等。
这个字段的类型可能是 struct if_data 或 struct rtnl_link_stats64，具体取决于编译环境中的 libnl 库版本
*/

    //结构体的一个节点，用于将接口关联到路由表的节点
	struct route_node *node;

    //这个接口所属的 VRF（Virtual Routing and Forwarding）实例
	struct vrf *vrf;

	/*
	 * Has the end users entered `interface XXXX` from the cli in some
	 * fashion?
	 */
    //是否已在 CLI（Command Line Interface）中配置了此接口
	bool configured;

	QOBJ_FIELDS;
    /*
    PREDECL_HASH(qobj_nodes);
    
    /* anchor to be embedded somewhere in the object's struct */
    struct qobj_node {
    	uint64_t nid;
    	struct qobj_nodes_item nodehash;
    	const struct qobj_nodetype *type;
    };
    
    #define QOBJ_FIELDS struct qobj_node qobj_node
    */
};
```

### struct connected

用于保存与某个接口相关联的连接地址信息的结构体。该结构体中的每个字段都描述了连接地址的各种属性和标志

```
/* Connected address structure. */
struct connected {
	/* Attached interface. */
	struct interface *ifp;

	/* Flags for configuration. */
	uint8_t conf;
#define ZEBRA_IFC_REAL         (1 << 0)
#define ZEBRA_IFC_CONFIGURED   (1 << 1)
#define ZEBRA_IFC_QUEUED       (1 << 2)
#define ZEBRA_IFC_DOWN         (1 << 3)
	/*
	   The ZEBRA_IFC_REAL flag should be set if and only if this address
	   exists in the kernel and is actually usable. (A case where it exists
	   but is not yet usable would be IPv6 with DAD)
	   The ZEBRA_IFC_CONFIGURED flag should be set if and only if this
	   address was configured by the user from inside frr.
	   The ZEBRA_IFC_QUEUED flag should be set if and only if the address
	   exists in the kernel. It may and should be set although the
	   address might not be usable yet. (compare with ZEBRA_IFC_REAL)
	   The ZEBRA_IFC_DOWN flag is used to record that an address is
	   present, but down/unavailable.
	 */
     /*
     代表此连接地址的配置信息，包括：
     
         ZEBRA_IFC_REAL: 如果存在于内核中并且实际可用，则设置为1。
         ZEBRA_IFC_CONFIGURED: 如果此地址是由用户从 frr 中配置的，则设置为1。
         ZEBRA_IFC_QUEUED: 如果地址存在于内核中，则设置为1，即使它可能尚不可用。
         ZEBRA_IFC_DOWN: 记录某个地址已存在，但已经停用或不可用的状态，设置为1
     */

	/* Flags for connected address. */
	uint8_t flags;
#define ZEBRA_IFA_SECONDARY    (1 << 0)
#define ZEBRA_IFA_PEER         (1 << 1)
#define ZEBRA_IFA_UNNUMBERED   (1 << 2)
	/* N.B. the ZEBRA_IFA_PEER flag should be set if and only if
	   a peer address has been configured.  If this flag is set,
	   the destination field must contain the peer address.
	 */
    /*
    描述连接地址的各种标志，包括：
    
        ZEBRA_IFA_SECONDARY: 如果此地址是连接上的第二个地址(也就是这个地址不是该接口的主要地址，而是多个地址中的次要地址)，则设置为1。
        ZEBRA_IFA_PEER: 如果已配置对等地址(对等地址是在两个网络设备之间互相配置的 IP 地址，通常用于一些网络服务（如 VPN、GRE 等）中，用于建立虚拟链路或通道。在这种情况下，这个连接地址的目标地应该是对等地址，即与此连接地址相关的另一个网络设备的地址)，则设置为1。
        ZEBRA_IFA_UNNUMBERED: 如果地址为不编号地址（unnumbered），则设置为1。
    
    注意，如果 ZEBRA_IFA_PEER 标志被设置，则目的地字段必须包含对等地址。
    */

	/* Address of connected network. */
    //连接网络的地址
	struct prefix *address;

	/* Peer address, if ZEBRA_IFA_PEER is set, otherwise NULL */
    //如果 ZEBRA_IFA_PEER 被设置，则此字段必须包含对等地址。否则设置为 NULL
	struct prefix *destination;

    /*
    address 和 destination 都是连接地址中的 IP 地址信息，区别是什么：
    
    address 字段是指连接到网络的 IP 地址。在路由协议中，这个字段通常用于标识一个网络（Network），它是用一个 IP 地址加子网掩码形式来表示的，例如 172.16.0.0/16 表示的是一个 IP 地址为 172.16.0.0 的网络，子网掩码为 255.255.0.0。
    
    destination 字段是指连接地址的目的地址，它是一个针对对等地址是否存在的判断。如果存在对等地址，这个字段会被设置为对等地址；如果不存在，就会被设置为 NULL。因此，在有一些协议中，这个字段在表示对等连接时相当重要。
    
    需要注意的是，在相同的网络接口上，一个地址可能不只有一个系统配置，例如一个接口同时配置了主机地址和对等地址（peer address），此时需要用 destination 来区分两个地址
    */

	/* Label for Linux 2.2.X and upper. */
    //用于在 Linux 2.2 及更高版本中标识连接地址
    //label 是用于在 Linux 2.2.X 及其后续版本中标识连接地址的字段。当启用了多个相同的网络设备时，需要用 label 字段来标识每个网络设备上的连接地址。在 Linux 2.2.X 之前的版本中，通常使用设备名称（如 eth0、eth1 等）来区分连接地址。
	char *label;

	/*
	 * Used for setting the connected route's cost. If the metric
	 * here is set to METRIC_MAX the connected route falls back to
	 * "struct interface"
	 */
    //用于设置连接路由的成本。如果此处的度量值设置为 METRIC_MAX，则连接路由将回退到“struct interface”
    //metric 是用于设置连接路由成本的字段。在路由决策中，路由器会为每个可能到达目的地的路径赋予一个度量值（metric），值越小表示优先级越高。因此，通过设置 metric 的值，可以控制路由器如何选择特定的接口进行转发。在一些协
	uint32_t metric;
};

```

### struct nbr_connected

```
/* Nbr Connected address structure. */
struct nbr_connected {
	/* Attached interface. */
	struct interface *ifp;

	/* Address of connected network. */
	struct prefix *address;
};
```

### struct route_table

```
/* Routing table top structure. */
struct route_table {
	struct route_node *top;//trie树root根节点
	struct rn_hash_node_head hash;//route_node的hash链表，为了实现route_node节点的O(1)复杂度获取
    /*
    PREDECL_HASH(rn_hash_node);
    struct rn_hash_node_head { struct thash_head hh; };                              \
    struct rn_hash_node_item { struct thash_item hi; }; 
    */
	
	/*
	 * Delegate that performs certain functions for this table.
	 */
	route_table_delegate_t *delegate;//create_node和destroy_node接口，给route_node分配内存和释放内存的
	void (*cleanup)(struct route_table *, struct route_node *);

	unsigned long count;//route_table中route_node数量

	/*
	 * User data.
	 */
	void *info;//在不同的地方代表不同的含义，基本是封装有route_table信息的一层包装
    /* 
    可以是:
    struct rib_table_info {
    	struct zebra_vrf *zvrf;
    	afi_t afi;
    	safi_t safi;
    	uint32_t table_id;
    };
    可以是：
    struct stable_info {
    	struct static_vrf *svrf;
    	afi_t afi;
    	safi_t safi;
    };
    还可以是bgp_table和zebra_vrf
*/
};
```

### rib_talbe_info

```
/*
 * rib_table_info_t
 *
 * Structure that is hung off of a route_table that holds information about
 * the table.
 */
struct rib_table_info {

	/*
	 * Back pointer to zebra_vrf.
	 */
	struct zebra_vrf *zvrf;
	afi_t afi;
	safi_t safi;
	uint32_t table_id;
};

/*
用于存储关于一张路由表（route_table）的信息。

具体解释如下：

    zvrf：表示指向关联的 VRF（Virtual Routing and Forwarding）的指针，即该表格所属的虚拟路由和转发实例。
    afi 和 safi：表示该表格中包含的路由的地址族（Address Family Identifier）和路由类型（Subsequent Address Family Identifier）。对于IPv4，AFI = 1，对于IPv6，AFI = 2，对于路由类型，如IPV4_UNICAST，IPV6_UNICAST等。
    table_id：表示该表格的唯一标识。是一个 uint32_t 类型的数值。

总的来说，该结构体提供了关于一张路由表的信息，并可以与某个 VRF 相关联。

IPV4_UNICAST什么意思?

IPV4_UNICAST 是一种路由类型（Subsequent Address Family Identifier - SAFI），表示 IPv4 单播路由。在 BGP （Border Gateway Protocol）中，SAFI 用于标识从一个节点到另一个节点传递的路由的类型。IPV4_UNICAST 路由类型用于传递单个目的地的 IPv4 路由，即单播路由，是 BGP 中最常用的路由类型。当一个节点需要向其他节点传递自己的 IPv4 路由时，可以使用 IPV4_UNICAST 类型，从而告诉其他节点如何到达该节点的 IP 地址。

IPv4除了单播路由，还有什么?

IPv4 还有以下路由类型：

    Multicast：用于传递 IPv4 组播（Multicast）路由。
    Unicast Flow：用于传递源和目的地都已知的流路单播路由。
    Multicast Flow：用于传递源和目的地都已知的组播流路路由。
    VPNv4：用于传递虚拟专用网络（VPN - Virtual Private Network）IPv4 路由信息，用于支持 BGP/MPLS IP VPNs。

其中，单播（Unicast）路由是 IPv4 协议中最常用的路由类型，即用于将数据包从源地址传输到目的地址。而组播（Multicast）路由是将数据包从一台设备传输到多个接收者的协议，VPNv4 则用于统一承载多个 VPN 的 IPv4 路由信息。

*/
```

### struct zebra_if

```
/* `zebra' daemon local interface structure. */
struct zebra_if {
	/* back pointer to the interface */
	struct interface *ifp;

	enum zebra_if_flags flags;
    /*
    ZIF_FLAG_EVPN_MH_UPLINK：用于表示该接口已经被配置为 EVPN 多路归并（Multihoming）的上联接口。在 EVPN 多路归并的场景中，两个 PE 交换机需要共享服务，此时将连接两个交换机的链路配置为 EVPN 多路归并链路。该标志位表示该接口已经被配置为这样的链路。
    ZIF_FLAG_EVPN_MH_UPLINK_OPER_UP：用于表示 EVPN 多路归并上联接口的运行状态是否正常。如果该标志位被设置为 1，表示该接口的运行状态是正常的；如果被设置为 0，表示该接口的运行状态是异常的。
    ZIF_FLAG_PROTODOWN：用于表示该接口当前被设置为下线状态。当该标志位被设置为 1，表示该接口处于下线状态；当被设置为 0，表示该接口处于上线状态。
    ZIF_FLAG_SET_PROTODOWN：用于表示将该接口设置为下线状态。当该标志位被设置为 1，表示将该接口设置为下线状态。
    ZIF_FLAG_UNSET_PROTODOWN：用于表示将该接口恢复为上线状态。当该标志位被设置为 1，表示将该接口恢复为上线状态。
    ZIF_FLAG_LACP_BYPASS：用于表示 LACP（Link Aggregation Control Protocol）绑定组中的成员接口是否处于绕过状态。将此标志位设置为 true 意味着该成员接口已经被绕过，不参与 LACP 协商。如果 LACP 绑定组中有任何一个成员接口被绕过，该标志位将被设置为 true，整个 LACP 绑定组状态将被视为绕过状态。
    enum zebra_if_flags {
    	/* device has been configured as an uplink for
    	 * EVPN multihoming
    	 */
    	ZIF_FLAG_EVPN_MH_UPLINK = (1 << 0),
    	ZIF_FLAG_EVPN_MH_UPLINK_OPER_UP = (1 << 1),
    
    	/* Dataplane protodown-on */
    	ZIF_FLAG_PROTODOWN = (1 << 2),
    	/* Dataplane protodown-on Queued to the dplane */
    	ZIF_FLAG_SET_PROTODOWN = (1 << 3),
    	/* Dataplane protodown-off Queued to the dplane */
    	ZIF_FLAG_UNSET_PROTODOWN = (1 << 4),
    
    	/* LACP bypass state is set by the dataplane on a bond member
    	 * and inherited by the bond (if one or more bond members are in
    	 * a bypass state the bond is placed in a bypass state)
    	 */
    	ZIF_FLAG_LACP_BYPASS = (1 << 5)
    };
    */

	/* Shutdown configuration. */
    //关机配置，用于表示该接口是否已经关闭。值为 0 表示没有关闭，值为 1 表示已经关闭
	uint8_t shutdown;

	/* Multicast configuration. */
    //组播配置，用于表示该接口是否开启了组播功能。值为 0 表示没有开启，值为 1 表示已经开启
	uint8_t multicast;

	/* MPLS status. */
    //MPLS 配置，用于表示该接口是否开启了 MPLS 功能。值为 true 表示开启，值为 false 表示关闭
	bool mpls;

	/* Linkdown status */
    //链路状态，用于表示该接口是否处于下线状态。值为 true 表示已下线，值为 false 表示未下线
	bool linkdown, linkdownv6;

	/* Is Multicast Forwarding on? */
    //组播转发功能开关。分别表示 IPv4 和 IPv6 网络中的组播数据包是否被该接口开启转发功
	bool v4mcast_on, v6mcast_on;

	/* Router advertise configuration. */
    //用于表示该接口是否开启了 Router Advertise 功能。值为 0 表示没有开启，值为 1 表示已经开启
	uint8_t rtadv_enable;

	/* Installed addresses chains tree. */
    //IPv4 地址表，用于存储该接口的 IPv4 地址和子网掩码。这是一个指向 route_table 结构体的指针，其中包含了 IPv4 地址和掩码的信息
	struct route_table *ipv4_subnets;

	/* Nexthops pointing to this interface */
	/**
	 * Any nexthop that we get should have an
	 * interface. When an interface goes down,
	 * we will use this list to update the nexthops
	 * pointing to it with that info.
	 */
    //下一跳依赖链表，用于存储依赖于该接口的下一跳的信息。是一个结构体 nhg_connected_tree_head 的变量，其中存储了依赖于该接口的下一跳的相关信息
	struct nhg_connected_tree_head nhg_dependents;

	/* Information about up/down changes */
	unsigned int up_count;
	char up_last[FRR_TIMESTAMP_LEN];
	unsigned int down_count;
	char down_last[FRR_TIMESTAMP_LEN];
    /*
    up_count、up_last、down_count、down_last：接口状态变更计数器和时间戳。up_count 和 down_count 分别表示该接口上线和下线的次数。up_last 和 down_last 是相应的时间戳
    */

    //Router Advertise 配置信息。包括了 Router Advertise 相关的细节和参数，例如 RA 周期、RA 前缀等
	struct rtadvconf rtadv;
    //已发送和已接收的 Router Advertise 消息数
	unsigned int ra_sent, ra_rcvd;

    //IRD 表示 Intra-router Discovery，即网络内部路由器发现协议。该字段用于存储该接口的 IRD 相关信息
	struct irdp_interface *irdp;

#ifdef HAVE_STRUCT_SOCKADDR_DL
	union {
		/* note that sdl_storage is never accessed, it only exists to
		 * make space.
		 * all actual uses refer to sdl - but use sizeof(sdl_storage)!
		 * this fits
		 * best with C aliasing rules. */
         //这两个字段都用于表示网络接口的物理层信息（如接口名称、MAC 地址等）
		struct sockaddr_dl sdl;
		struct sockaddr_storage sdl_storage;
	};
#endif

	/* ptm enable configuration */
    //PTM 配置，用于表示该接口是否开启 PTM 功能（Packet Transfer Mode，即数据包传输模式）。值为 0 表示没有开启，值为 1 表示已经开启
	uint8_t ptm_enable;

	/* Zebra interface and "slave" interface type */
    //表示该接口的物理层信息（如 Ethernet、WiFi 等），具体类型定义在 zebra_iftype 枚举类型中
	enum zebra_iftype zif_type;
    /*
    /* Zebra interface type - ones of interest. */
    enum zebra_iftype {
    	ZEBRA_IF_OTHER = 0, /* Anything else */
    	ZEBRA_IF_VXLAN,     /* VxLAN interface */
    	ZEBRA_IF_VRF,       /* VRF device */
    	ZEBRA_IF_BRIDGE,    /* bridge device */
    	ZEBRA_IF_VLAN,      /* VLAN sub-interface */
    	ZEBRA_IF_MACVLAN,   /* MAC VLAN interface*/
    	ZEBRA_IF_VETH,      /* VETH interface*/
    	ZEBRA_IF_BOND,	    /* Bond */
    	ZEBRA_IF_BOND_SLAVE,	    /* Bond */
    	ZEBRA_IF_GRE,      /* GRE interface */
    };
    ZEBRA_IF_OTHER：其他类型的接口，值为 0.
    ZEBRA_IF_VXLAN：VxLAN 接口，值为 1。
    ZEBRA_IF_VRF：VRF 设备，值为 2。
    ZEBRA_IF_BRIDGE：网桥设备，值为 3。
    ZEBRA_IF_VLAN：VLAN 子接口，值为 4。
    ZEBRA_IF_MACVLAN：MAC VLAN 接口，值为 5。
    ZEBRA_IF_VETH：VETH 接口，值为 6。
    ZEBRA_IF_BOND：Bond 接口，值为 7。
    ZEBRA_IF_BOND_SLAVE：Bond 从接口，值为 8。
    ZEBRA_IF_GRE：GRE 接口，值为 9。

此处列出的接口类型在网络编程中比较常见，例如：VxLAN 是一种用于扩展虚拟局域网 (VLAN) 的技术，VRF 是一种用于将网络中的流量隔离的技术，Bond 是一种将多个接口绑定成虚拟接口以提高吞吐量和可靠性的技术。
    */
    /从属接口类型。当该接口是一个从属接口时，这个字段指示了该从属接口的类型/
	enum zebra_slave_iftype zif_slave_type;
    /*
    /* Zebra "slave" interface type */
    enum zebra_slave_iftype {
    	ZEBRA_IF_SLAVE_NONE,   /* Not a slave */
    	ZEBRA_IF_SLAVE_VRF,    /* Member of a VRF */
    	ZEBRA_IF_SLAVE_BRIDGE, /* Member of a bridge */
    	ZEBRA_IF_SLAVE_BOND,   /* Bond member */
    	ZEBRA_IF_SLAVE_OTHER,  /* Something else - e.g., bond slave */
    };
    */

	/* Additional L2 info, depends on zif_type */
	union zebra_l2if_info l2info;
    /*
    union zebra_l2if_info {
    	struct zebra_l2info_bridge br;
    	struct zebra_l2info_vlan vl;
    	struct zebra_l2info_vxlan vxl;
    	struct zebra_l2info_gre gre;
    };
    */

	/* For members of a bridge, link to bridge. */
	/* Note: If additional fields become necessary, this can be modified to
	 * be a pointer to a dynamically allocd struct.
	 */
	struct zebra_l2info_brslave brslave_info;
    /*
    /* zebra L2 interface information - bridge slave (linkage to bridge) */
    struct zebra_l2info_brslave {
    	ifindex_t bridge_ifindex; /* Bridge Master */
    	struct interface *br_if;  /* Pointer to master */
    	ns_id_t ns_id; /* network namespace where bridge is */
    };
    */

	struct zebra_l2info_bondslave bondslave_info;
	struct zebra_l2info_bond bond_info;

	/* ethernet segment */
	struct zebra_es_if_info es_info;

	/* bitmap of vlans associated with this interface */
    //与此接口关联的 VLAN 的位图
	bitfield_t vlan_bitmap;

	/* An interface can be error-disabled if a protocol (such as EVPN or
	 * VRRP) detects a problem with keeping it operationally-up.
	 * If any of the protodown bits are set protodown-on is programmed
	 * in the dataplane. This results in a carrier/L1 down on the
	 * physical device.
	 */
	uint32_t protodown_rc;
    /*
    用于标识接口是否从协议层面被禁用。其中，“proto”表示协议，“down”表示接口失效。当这个变量不为0时，它表示一个位图，表示禁用接口的原因：
    
        bit 0: 接口被禁用，具体原因未知。
        bit 1: EVPN 检测到接口故障，禁用接口。
        bit 2: VRRP 检测到接口故障，禁用接口。
        bit 3: OSPFv3 检测到接口故障，禁用接口。
        bit 4: ISIS 检测到接口故障，禁用接口。
        bit 5: BGP 检测到接口故障，禁用接口。
        bit 6: PIM 检测到接口故障，禁用接口。
        bit 7: IGMP 检测到接口故障，禁用接口。
        bit 8: LDP 检测到接口故障，禁用接口。
        bit 9: MPLS LSR 检测到接口故障，禁用接口。
        bit 10: BFD 检测到接口故障，禁用接口。
        bit 11: LDP 检测到标签分配故障，禁用接口
    */

	/* list of zebra_mac entries using this interface as destination */
	struct list *mac_list;

	/* Link fields - for sub-interfaces. */
	ifindex_t link_ifindex;
	struct interface *link;
    /*
    当使用VLAN时，可以将多个VLAN添加到单个物理接口上，此时每个VLAN将成为一个子接口。在这种情况下，现有的接口成为母接口，而子接口可链接到母接口。每个子接口都有一个唯一的ID，称为link_ifindex。link是子接口使用的接口。link的值是指向母接口的指针，因此可以在需要访问母接口的时候方便地进行处理。同时，当对母接口进行更改时，Zebra也可以更容易地找到它的所有子接口。
    */

	uint8_t speed_update_count;
	struct thread *speed_update;

	/*
	 * Does this interface have a v6 to v4 ll neighbor entry
	 * for bgp unnumbered?
	 */
	bool v6_2_v4_ll_neigh_entry;
    /*
    v6_2_v4_ll_neigh_entry是一个布尔值（bool类型），表示一个接口是否有一个IPv6到IPv4链接本地（link-local）邻居条目，这是用于BGP无编号协议的。BGP无编号协议的一个特点是它不需要在BGP邻居之间使用IP地址。这是通过引入一个IPv6到IPv4链接本地邻居条目来实现的。它指示某个IPv6地址实际上是一个虚拟地址，代表由其他路由器的IPv4地址表示的实际邻居关系。由此可以避免使用IPv4地址来替代IPv6地址，并减少IPv4地址的使用。 v6_2_v4_ll_neigh_entry的值为true时，表示此接口上的IPv6地址实际上是虚拟的，并代表其他路由器的IPv4地址。在这种情况下，还有一个跟踪此IPv6到IPv4链接本地邻居的MAC地址的neigh_mac变量，还有该邻居的IPv6地址，存储在v6_2_v4_ll_addr6中
    */
	char neigh_mac[6];
    /*
    neigh_mac和mac_list的区别
    
    neigh_mac和mac_list都与MAC地址有关，但它们又有着不同的用途和含义。
    
    neigh_mac是一个用于记录IPv6到IPv4链接本地邻居MAC地址的字符数组，用于BGP无编号协议。当目标地址是一个IPv6到IPv4的链接本地邻居地址时，需要知道该邻居的MAC地址。在这种情况下，会使用neigh_mac来存储此MAC地址。
    
    而mac_list是指向Zebra中使用接口作为目标地址的MAC地址项列表的指针。在这个列表中，会存储Zebra中与特定接口相关联的MAC地址条目。这种类型的列表主要优点是可以快速查找指向单个接口的所有MAC地址条目
    */
	struct in6_addr v6_2_v4_ll_addr6;

	/* The description of the interface */
	char *desc;
};
```

### struct zebra_vrf

```
/* Routing table instance.  */
//路由表的一个实例
struct zebra_vrf {
	/* Back pointer */
    //指向该路由表所属的VRF（虚拟路由和转发）结构的指针
	struct vrf *vrf;

	/* Description.  */
	char *desc;

	/* FIB identifier.  */
    //该路由表的FIB（转发信息库）标识符
	uint8_t fib_id;

	/* Flags. */
	uint16_t flags;
#define ZEBRA_VRF_RETAIN          (1 << 0)
#define ZEBRA_PIM_SEND_VXLAN_SG   (1 << 1)
/*
    ZEBRA_VRF_RETAIN：即使不被使用，该VRF也不应该被删除。
    ZEBRA_PIM_SEND_VXLAN_SG：在通过VxLAN段组发送PIM组播数据包时设置。
*/

    //该路由表的唯一标识符
	uint32_t table_id;

	/* Routing table.  */
    //每个AFI（地址家族标识符）和SAFI（Subsequent Address Family Identifier）有一个指向route_table结构的指针
	struct route_table *table[AFI_MAX][SAFI_MAX];

	/* Recursive Nexthop table */
    //每个AFI都有一个指向路由表结构的指针，用于递归下一跳查找
	struct route_table *rnh_table[AFI_MAX];
    //与“rnh_table”相同，但用于多播路由
	struct route_table *rnh_table_multicast[AFI_MAX];

    //链表的头结构，链接其他未在“table”或“rnh_table”数组中的路由表
	struct otable_head other_tables;

	/* 2nd pointer type used primarily to quell a warning on
	 * ALL_LIST_ELEMENTS_RO
	 */
    //按其路由实例ID（RID）排序的VRF实例（RI）链接列表
	struct list _rid_all_sorted_list;
	struct list _rid_lo_sorted_list;

    //与前面类似，但用于IPv6 RI
	struct list *rid_all_sorted_list;
	struct list *rid_lo_sorted_list;

    //IPv4和IPv6 RI的默认路由目标(RT)的用户分配的前缀
	struct prefix rid_user_assigned;
	struct list _rid6_all_sorted_list;
	struct list _rid6_lo_sorted_list;
	struct list *rid6_all_sorted_list;
	struct list *rid6_lo_sorted_list;
	struct prefix rid6_user_assigned;

	/*
	 * Back pointer to the owning namespace.
	 */
    //该路由表所属的命名空间的指针
	struct zebra_ns *zns;
    /*
    struct zebra_ns {
    	/* net-ns name.  */
    	char name[VRF_NAMSIZ];
    
    	/* Identifier. */
    	ns_id_t ns_id;
    
    #ifdef HAVE_NETLINK
        //用于与内核通信的netlink套接字接口
    	struct nlsock netlink;        /* kernel messages */
        //用于向内核发送命令的netlink套接字接口
    	struct nlsock netlink_cmd;    /* command channel */
        /*
        //向内核发送和接收消息的底层套接字接口的属
        /* Socket interface to kernel */
        struct nlsock {
        	int sock;
        	int seq;//用于此套接字接口的序列号
        	struct sockaddr_nl snl;//内核套接字地址结构，于指定Netlink套接字的地址
            /*
            struct sockaddr_nl {
                //套接字地址的协议族，是AF_NETLINK
            	__kernel_sa_family_t	nl_family;	/* AF_NETLINK	*/
                //填充字段，通常为0
            	unsigned short	nl_pad;		/* zero		*/
                //内核或使用Netlink套接字通信的进程的端口 ID，可以是单播或广播。
            	__u32		nl_pid;		/* port ID	*/
                /一个用于指定多播组的掩码。如果nl_groups的某个位被设置为1，则表示该套接字将接收到与该位相应的多播组的消息/
                   	__u32		nl_groups;	/* multicast groups mask */
            };
            */
            //这个套接字接口的名称
        	char name[64];
        
            //发送和接收消息的缓冲区
        	uint8_t *buf;
        	size_t buflen;
        };
        */
    
    	/* dplane system's channels: one for outgoing programming,
    	 * for the FIB e.g., and one for incoming events from the OS.
    	 */
        //用于向内核发送和接收事件的netlink套接字接口
    	struct nlsock netlink_dplane_out;
    	struct nlsock netlink_dplane_in;
        //用于处理内核消息的线程
    	struct thread *t_netlink;
    #endif
    
        //该命名空间的接口路由表
    	struct route_table *if_table;
    
    	/* Back pointer */
    	struct ns *ns;
    };
    */

	/* MPLS Label to handle L3VPN <-> vrf popping */
    //用于处理L3VPN <-> VRF弹出的MPLS标签，每个AFI一个
	mpls_label_t label[AFI_MAX];
    //每个AFI的标签协议（IPv4或IPv6）
	uint8_t label_proto[AFI_MAX];

	/* MPLS static LSP config table */
    //包含MPLS静态LSP（标签交换路径）的哈希表
	struct hash *slsp_table;

	/* MPLS label forwarding table */
    /包含MPLS标签的转发信息的哈希表/
	struct hash *lsp_table;

	/* MPLS FEC binding table */
    //每个AFI都有一个指向路由表结构的指针，用于MPLS FEC（转发等效类）绑定
	struct route_table *fec_table[AFI_MAX];

	/* MPLS Segment Routing Global block */
    //一个MPLS段路由全局块（SRGB）
	struct mpls_srgb mpls_srgb;

	/* Pseudowires. */
	struct zebra_pw_head pseudowires;
	struct zebra_static_pw_head static_pseudowires;

    //每个AFI和特定路由类型（例如ZEBRA_ROUTE_KERNEL，ZEBRA_ROUTE_STATIC等）的路由映射数组
	struct zebra_rmap proto_rm[AFI_MAX][ZEBRA_ROUTE_MAX + 1];
    /*
    struct zebra_rmap {
    	char *name;
    	struct route_map *map;
    };
    
    /* Route map list structure. */
    //路由映射
    struct route_map {
    	/* Name of route map. */
        /路由映射的名称，由一个 char* 指向字符串表示/
    	char *name;
    
    	/* Route map's rule. */
        //head 和 tail（链表的头和尾，指向一个 route_map_index 结构体的指针，这个结构体包含了路由映射规则的内容）
    	struct route_map_index *head;
    	struct route_map_index *tail;
    
    	/* Make linked list. */
    	struct route_map *next;
    	struct route_map *prev;
    
    	/* Maintain update info */
        //一个布尔值，表示这个路由映射是否被修改但未被使用，以待处理
    	bool to_be_processed; /* True if modification isn't acted on yet */
        //一个布尔值，表示这个路由映射是否被删除
    	bool deleted;         /* If 1, then this node will be deleted */
        //个布尔值，表示这个路由映射是否被禁止优化
    	bool optimization_disabled;
    
    	/* How many times have we applied this route-map */
        //这个路由映射被应用的次数，以及在何时被清空
    	uint64_t applied;
    	uint64_t applied_clear;
    
    	/* Counter to track active usage of this route-map */
        //一个计数器，用于跟踪这个路由映射的活动使用情况
    	uint16_t use_count;
    
    	/* Tables to maintain IPv4 and IPv6 prefixes from
    	 * the prefix-list match clause.
    	 */
        /用于维护 IPv4 和 IPv6 前缀的路由表/
    	struct route_table *ipv4_prefix_table;
    	struct route_table *ipv6_prefix_table;
    
       //用于添加结构体填充，不必深究
    	QOBJ_FIELDS;
    };
    */
    //与“proto_rm”类似，但用于下一跳表路由映射
	struct zebra_rmap nht_rm[AFI_MAX][ZEBRA_ROUTE_MAX + 1];

	/* MPLS processing flags */
	uint16_t mpls_flags;
#define MPLS_FLAG_SCHEDULE_LSPS    (1 << 0)
/*
MPLS处理的标志的位字段

    MPLS_FLAG_SCHEDULE_LSPS：当LSP（标签交换路径）计划待处理时设置。
*/

	/*
	 * EVPN hash table. Only in the EVPN instance.
	 */
    //EVPN路由的哈希表
	struct hash *evpn_table;

	/*
	 * Whether EVPN is enabled or not. Only in the EVPN instance.
	 */
    /一个布尔值，指示EVPN是否应发布所有VNI（VXLAN网络标识符）值，还是仅对存在路由的值/
	int advertise_all_vni;

	/*
	 * Whether we are advertising g/w macip in EVPN or not.
	 * Only in the EVPN instance.
	 */
    //一个布尔值，指示EVPN是否应发布网关MAC-IP路由
	int advertise_gw_macip;

    //一个布尔值，指示EVPN是否应发布SVI MAC-IP路由
	int advertise_svi_macip;

	/* l3-vni info */
    //L3-VNI的VNI值
	vni_t l3vni;

	/* pim mroutes installed for vxlan flooding */
    /用于为VXLAN-EVPN洪泛安装PIM组播路由的哈希表/
	struct hash *vxlan_sg_table;

    //一个布尔值，指示是否启用重复地址检测
	bool dup_addr_detect;

    //执行重复地址检测的时间
	int dad_time;
    //在延迟处理前允许的检测地址发现尝试的最大数量
	uint32_t dad_max_moves;
    //一个布尔值，指示当前是否冻结了重复地址检测
	bool dad_freeze;
    //当前DADF冻结的持续时间
	uint32_t dad_freeze_time;

	/*
	 * Flooding mechanism for BUM packets for VxLAN-EVPN.
	 */
    //用于VXLAN-EVPN的BUM（广播，未知单播，多播）数据包的洪泛机制
	enum vxlan_flood_control vxlan_flood_ctrl;
    /*
    /* Flooding mechanisms for BUM packets. */
    /* Currently supported mechanisms are head-end (ingress) replication
     * (which is the default) and no flooding. Future options could be
     * using PIM-SM, PIM-Bidir etc.
     */
    enum vxlan_flood_control {
    	VXLAN_FLOOD_HEAD_END_REPL = 0,
    	VXLAN_FLOOD_DISABLED,
    	VXLAN_FLOOD_PIM_SM,
    };
    用于指定 BUM（Broadcast, Unknown unicast and Multicast）数据包的洪泛（flood）机制。具体解释如下：
    
        VXLAN_FLOOD_HEAD_END_REPL（默认设置）：表示使用源节点（ingress）的复制方式进行洪泛，也就是数据包会被复制到每个目的节点（egress）。这是一种简单的洪泛机制，但可能会对网络流量造成较大的负担。
        VXLAN_FLOOD_DISABLED：表示禁止洪泛机制，即不再进行数据包的广播、未知单播或组播。
        VXLAN_FLOOD_PIM_SM：可以理解为使用 PIM-SM（Protocol Independent Multicast - Sparse Mode）协议进行洪泛。该协议可以通过构建多播树来控制数据包的发送和接收，可以减少网络流量，但需要较为复杂的部署和配置。
    
    该段代码的作用是为数据包提供不同的洪泛选项，以便在网络通信过程中进行灵活的控制。
    */

	/* Install stats */
	uint64_t installs;
	uint64_t removals;
	uint64_t installs_queued;
	uint64_t removals_queued;
	uint64_t neigh_updates;
	uint64_t lsp_installs_queued;
	uint64_t lsp_removals_queued;
	uint64_t lsp_installs;
	uint64_t lsp_removals;
    /*
    此路由表的各种安装和删除操作的计数器
    */

    //管理用
	struct table_manager *tbl_mgr;
    /*
    /*
     * Main table manager struct
     * Holds a linked list of table chunks.
     */
    struct table_manager {
    	struct list *lc_list;
    	uint32_t start;
    	uint32_t end;
    };
    该段代码定义了一个名为 table_manager 的结构体，用于管理一组具有相邻 IP 地址范围的表格（table）。
    
    具体解释如下：
    
        lc_list：表示一个链表，存储了该表格中所有的表格块（即IP地址范围成段的部分），采用双向链表结构（由 struct list 维护）。每个块中保存了从起始 IP 地址到终止 IP 地址之间的映射。
        start 和 end：表示该表格管理的 IP 地址范围的起始值和终止值。例如，start=192.168.1.0， end=192.168.10.0，表示该表格管理了从 192.168.1.0 到 192.168.10.0 之间的所有 IP 地址。
    
    总的来说，该结构体定义了一个数据结构，用于管理相邻 IP 地址范围的表格，并提供了该表格的起始地址、结束地址以及所有表格块的链表。
    */

    //管理用
	struct rtadv rtadv;

    //布尔值，指示默认路由（IPv4和IPv6）是否启用
	bool zebra_rnh_ip_default_route;
	bool zebra_rnh_ipv6_default_route;
};
```

### struct prefix

```
struct flowspec_prefix {
	uint8_t family;
	uint16_t prefixlen; /* length in bytes */
	uintptr_t ptr;
};
/*
family是一个8位(即一个字节)的无符号整数，表示IP地址的协议簇。这个成员变量的取值范围通常是0和1，分别表示IPv4和IPv6协议簇。

"prefixlen" : 类型为 uint16_t ，表示网络前缀的长度，以字节为单位。例如，如果是 IPv4 的前缀长度为 24，那么网络前缀部分就有 3 个字节，而 IP 地址的总长度是 4 个字节。

"ptr" : 类型为 uintptr_t ，表示网络前缀的指针，指向存放网络前缀的地址。系统会根据网络前缀的长度，来确定使用多少个字节来存储网络前缀，然后将网络前缀的二进制形式存放在 "ptr" 指针指向的内存地址中

eg.
    struct flowspec_prefix prefix;
    prefix.family = 1; // IPv4 family
    prefix.prefixlen = 2; // 2 bytes = 16 bits prefix length
    uint8_t ipv4_prefix[] = {192, 168}; // assign IPv4 prefix data
    prefix.ptr = (uintptr_t)ipv4_prefix;

flowspec_prefix是一个用于流量规划的IP地址前缀类型，它用于指定一组网络数据流的特征，以便网络设备可以对它们进行特殊处理。流量规划通常用于网络中的流量控制、安全和质量保证等方面。

在flowspec_prefix中，family成员变量用于指定IP地址的协议簇，prefixlen用于指定IP地址的前缀长度，而ptr则用于存储IP地址的前缀数据。网络设备在流量规划的过程中使用这些信息，可以通过匹配IP地址前缀来确定是否应该对该组数据流进行特殊处理。

举个例子，假设有一个基于IPv4的网络环境，其中某个管理员想要针对一组特殊的应用程序流量进行特殊处理。管理员可以使用flowspec_prefix指定该组流量的IP地址前缀，然后将一些特殊的规则绑定到这个前缀上，比如限制其带宽、策略路由或者进行深度流量分析等操作。这种方法可以为管理员提供一种有效的管理手段，可以更好地控制和保护网络中的数据流。
*/

/* FRR generic prefix structure. */
struct prefix {
    //表示 IP 地址族，即地址类型，可能是 IPv4、IPv6、以太网 (AF_ETHERNET)、EVPN (AF_EVPN)、流规范 (AF_FLOWSPEC)
	uint8_t family;
    //表示网络前缀的长度，以比特位数计算。例如，如果是 IPv4 的前缀长度为 24，那么网络前缀部分就有 24 个二进制位，而 IP 地址的总长度是 32 个二进制位
	uint16_t prefixlen;
    //为了保存各种不同地址类型的网络前缀或其他相关信息
	union {
		uint8_t prefix;
		struct in_addr prefix4;
		struct in6_addr prefix6;
        /*
        prefix: 数据类型为 uint8_t，表示网络地址前缀的长度（以比特位为单位）。在 IPv4 子网中，前缀通常是 8 位到 30 位长，而在 IPv6 子网中，前缀通常是 64 位长。
    
        prefix4: 数据类型为 struct in_addr，表示 IPv4 子网的网络地址前缀。它是一个 32 位的无符号整数，通常将它以点分十进制 (dotted decimal) 的格式进行表示，例如 192.168.0.0。
    
        prefix6: 数据类型为 struct in6_addr，表示 IPv6 子网的网络地址前缀。它是一个 128 位的地址，通常将它以冒号分隔符的格式（即 IPv6 地址缩写）进行表示，例如 2001:0db8:85a3::/64。
    
        网络地址前缀是一种用于描述子网的通用术语，在计算机网络中被广泛应用。它不仅可以用于路由寻址，还可以用于其他各种网络管理和安全任务，如子网分割、ACL（访问控制列表）和 VPN（虚拟专用网络）等。
        */
		struct {
			struct in_addr id;
			struct in_addr adv_router;
		} lp;
        /*
        这是一个结构体，其中包含成员 lp。lp 是一个匿名结构体，表示一个缩写为 "Link Parameters" 的数据结构。lp 结构体包含了两个成员变量：
        
            id: 数据类型为 struct in_addr，表示某个网络连接的 ID，通常使用 IPv4 地址来唯一标识。
        
            adv_router: 数据类型为 struct in_addr，表示该连接前进转发信息的路由器的 IP 地址。
        
        这个结构体在一些互联网的协议中使用，例如 RIP(Routing Information Protocol)、OSPF(Open Shortest Path First) 等等，用于描述网络连接的参数信息。

        eg.
            假设一个公司内部有多个子网，每个子网都有一个唯一的 IPv4 地址。为了让所有子网内的所有主机都能互相访问，需要在这些子网之间建立连接。一个比较常见的做法是使用路由器来实现不同子网之间的转发。
            
            在这个情境下，可以使用 lp 结构体来描述某个子网和相应的路由器之间的连接属性，例如：
            
            struct {
                struct in_addr id;         // 子网的 IPv4 地址，例如 10.3.0.0
                struct in_addr adv_router; // 连接该子网的路由器的 IP 地址，例如 192.168.1.1
            } lp;

            eg.
                struct {
                    uint8_t prefix;                 // 子网前缀长度，例如 26
                    struct in_addr prefix4;         // 子网 IPv4 前缀，例如 192.168.0.0
                    struct in6_addr prefix6;        // 子网 IPv6 前缀，可以不设置
                } subnet[4] = {
                    { 26, {192, 168, 0, 0}, 0 },    // 子网 192.168.0.0/26，包含 IP 192.168.0.1 ~ 192.168.0.62
                    { 26, {192, 168, 0, 64}, 0 },   // 子网 192.168.0.64/26，包含 IP 192.168.0.65 ~ 192.168.0.126
                    { 26, {192, 168, 0, 128}, 0 },  // 子网 192.168.0.128/26，包含 IP 192.168.0.129 ~ 192.168.0.190
                    { 26, {192, 168, 0, 192}, 0 }   // 子网 192.168.0.192/26，包含 IP 192.168.0.193 ~ 192.168.0.254
                };
            
            在具体的实现中，可以利用这个结构体来实现计算机网络协议中的路由算法（例如 RIP、OSPF 等），从而实现自适应路由和自动网络发现等功能。
        */
        //以太网地址结构体类型，用于保存以太网前缀的 MAC 地址
		struct ethaddr prefix_eth; /* AF_ETHERNET */
        /*
        /*
         * there isn't a portable ethernet address type. We define our
         * own to simplify internal handling
         */
        //由于缺少一个可移植的以太网地址类型，我们自己定义一个以太网地址结构体来方便内部处理。
        struct ethaddr {
            //ETH_ALEN 是一个宏定义，通常在 Linux 的头文件 <net/ethernet.h> 中被定义。它表示一个以太网地址的长度，通常是6个字节，即一个以太网地址由 6 个字节组成
        	uint8_t octet[ETH_ALEN];
        } __attribute__((packed));
        用于表示以太网地址。由于不同编译器可能会对结构体进行内存对齐和填充，为了确保结构体占用的内存大小和字节顺序等属性的可跨平台性，使用了 __attribute__((packed)) 进行结构体紧凑化处理。
        
        该结构体包含一个长度为6的 uint8_t 类型数组，用于存储以太网地址的6个字节。其中 ETH_ALEN 宏表示一个以太网地址的长度，通常是6个字节。

        eg.
        08:00:27:14:E6:3F，这个地址可以用于表示计算机网络中的一个网络设备（如路由器、交换机、计算机等）的唯一标识符
        */
		uint8_t val[16];
		uint32_t val32[4];
        /*
        保存前缀地址的 unsigned char [16] 或 uint32_t [4] 数组


        */
		uintptr_t ptr;
		struct evpn_addr prefix_evpn; /* AF_EVPN */
        /*
        /* EVPN address (RFC 7432) */
        //VPN (以太网虚拟专用网络) 中的前缀地址
        struct evpn_addr {
        	uint8_t route_type;
        	union {
        		struct evpn_ead_addr _ead_addr;
        		struct evpn_macip_addr _macip_addr;
        		struct evpn_imet_addr _imet_addr;
        		struct evpn_es_addr _es_addr;
        		struct evpn_prefix_addr _prefix_addr;
        	} u;
        #define ead_addr u._ead_addr
        #define macip_addr u._macip_addr
        #define imet_addr u._imet_addr
        #define es_addr u._es_addr
        #define prefix_addr u._prefix_addr
        };

        evpn_ead_addr：EVPN Ethernet段地址（Ethernet Auto-Discovery address），包含了ESI（Ethernet Segment Identifier）、以太网标签、IP地址和片段ID等字段。
    
        evpn_macip_addr：EVPN MAC和IP地址（MAC/IP Advertisement route），包含了以太网标签、IP地址前缀长度、MAC地址和IP地址等字段。
    
        evpn_imet_addr：EVPN Inclusive Multicast Ethernet Tag路由，包含了以太网标签、IP地址前缀长度和IP地址等字段。
    
        evpn_es_addr：EVPN Ethernet段路由（Ethernet Segment route），包含了ESI、IP地址前缀长度和IP地址等字段。
    
        evpn_prefix_addr：EVPN IP前缀路由（IP Prefix route），包含了以太网标签、IP地址前缀长度和IP地址等字段。
    
    这个EVPN地址结构体用于描述在EVPN网络中通信节点的位置和信息，各个字段的含义和用途需要根据EVPN协议的规范进行理解
            */
    		struct flowspec_prefix prefix_flowspec; /* AF_FLOWSPEC */
    	} u __attribute__((aligned(8)));
};

/* IPv4 prefix structure. */
struct prefix_ipv4 {
	uint8_t family;
	uint16_t prefixlen;
	struct in_addr prefix __attribute__((aligned(8)));
};

/* IPv6 prefix structure. */
struct prefix_ipv6 {
	uint8_t family;
	uint16_t prefixlen;
	struct in6_addr prefix __attribute__((aligned(8)));
};

typedef struct esi_t_ {
	uint8_t val[ESI_BYTES];
} esi_t;

struct evpn_ead_addr {
	esi_t esi;
	uint32_t eth_tag;
	struct ipaddr ip;
	uint16_t frag_id;
};
/*
    esi：该成员变量表示 Extended System Interface (ESI) 值，类型为 esi_t 结构体。用于标识链接到 EVPN 网络上的 MAC 地址集合。
    eth_tag：该成员变量表示 Ethernet type 标签，类型为 uint32_t，用于标记 EVPN 包中的 L2 以太网报文的类型。
    ip：该成员变量表示 IPv4 地址，类型为 struct ipaddr，用于表示 EVPN 包中的 L3 报文中的源或目的 IP 地址。
    frag_id：该成员变量表示 IP 数据报分片的标识符，类型为 uint16_t，用于依据 IP 分层协议的需要，对 EVPN 包中的 IP 数据报进行分片和重组。

因此，evpn_ead_addr 结构体用于描述 EVPN 包中的 L2/L3 报文的信息，其中 L2 报文使用 esi 和 eth_tag 字段进行描述，L3 报文使用 ip 和 frag_id 字段进行描述。使用该结构体能够方便地对 EVPN 包的各个部分进行分类和处理。

    what:
        esi用来做什么的?
        
        在 EVPN（以太网虚拟专用网）中，ESI（Extended System Interface）是用于标识处于同一二层桥接域内的不同设备以及它们连接着的 VLAN 的值，它可以看作是二层的一个标识符。采取 EVPN 的目的是实现数据中心和广域网之间的二层扩展，既然要实现二层可达，就需要一个互相区分的标志，这个标志就是 ESI。
        
        通常，设备在接收 L2 数据包时，会通过查看 L2 数据包中的目的 MAC 地址来确定数据包的传输方向。在 EVPN 中使用 ESI 可以实现在二层网络中识别不同的设备，并进行不同的处理。具体来说，当一个设备通过 EVPN 发送数据包时，它将该数据包的目的 MAC 地址转换成一个 ESI，以便接收方设备可以根据 ESI 值来决定如何处理该数据包。
        
        此外，在 EVPN 中，ESI 还被用来实现多路径负载均衡，因为 ESI 可以表示与设备连接的不同物理接口，因此 ESI 值不同时，可以将流量路由到不同的接口上，实现负载均衡。
*/

struct evpn_macip_addr {
	uint32_t eth_tag;
	uint8_t ip_prefix_length;
	struct ethaddr mac;
	struct ipaddr ip;
};
/*
evpn_macip_addr 这个结构体是用来描述 MAC 地址和 IP 地址之间的关系，用于实现 L2/L3 交互。通过使用 evpn_macip_addr 可以对 EVPN 包中的 MAC 和 IP 地址进行分类和处理，方便对数据包进行分析和转发
*/

struct evpn_imet_addr {
	uint32_t eth_tag;
	uint8_t ip_prefix_length;
	struct ipaddr ip;
};
/*
表示 EVPN 网络中的 IP 子网到 ETAG 的映射关系
在 EVPN 中，该结构体可以用于实现 Layer 3 VXLAN 网关的功能，来实现在数据中心与广域网之间的 Layer 2 和 Layer 3 扩展。通常情况下，数据中心中的 VXLAN 网关将需要公网或互联网上的远程服务器地址映射到 EVPN IP 子网号和 ETAG 上，向 EVPN 网络中发送数据包时，将使用 evpn_imet_addr 来识别和路由控制数据包
*/

struct evpn_es_addr {
	esi_t esi;
	uint8_t ip_prefix_length;
	struct ipaddr ip;
};
/*
用于描述 EVPN 网络中的 Extended System Interface（ESI）地址和 IPv4 前缀地址之间的映射关系，其中：

    esi：一个 esi_t 类型的成员变量，表示 ESI 地址的值，用于用于标识链接到 EVPN 网络上的 MAC 地址集合。
    ip_prefix_length：一个 uint8_t 类型的成员变量，表示 IPv4 地址的网络前缀长度。
    ip：一个类型为 struct ipaddr 的成员变量，表示 ESI 对应的 IPv4 地址。

这个结构体用于描述 ESI 和 IPv4 前缀地址之间的关系，通过使用 evpn_es_addr 可以实现对 EVPN 包中的不同地址的识别和分类。其中，ESI 可以表示连接至设备中的不同物理接口，而 IPv4 前缀地址则用于标识连接至该接口的设备的地址。

在实际使用时，该结构体可以用于实现 EVPN 网络的多路径负载均衡功能。每个 ESI 表示网络中的一个连接，根据 ESI 和 IPv4 前缀地址的映射关系，可以将不同的流量分配到不同的路径上，从而实现负载均衡
*/

struct evpn_prefix_addr {
	uint32_t eth_tag;
	uint8_t ip_prefix_length;
	struct ipaddr ip;
};
/*
用于描述 EVPN 网络中的 IPv4 前缀地址
该结构体用于 EVPN 网络中向外发布 IPv4 前缀地址，并让其他设备可以通过该地址到达该 EVPN 网络。eth_tag 字段用于标识 EVPN 包的类型，ip_prefix_length 表示该前缀地址的网络前缀的长度，而 ip 成员变量则存储该 IPv4 前缀的值。

通常，EVPN 网络在使用时需要为设备分配一个唯一的 IP 前缀地址，通过发布 evpn_prefix_addr 类型的数据包将该地址广播到所有 EVPN 设备中，从而实现网络中的 IPv4 地址互联和通信
*/

```

### struct route_node

```
/* Each routing entry. */
struct route_node {
	ROUTE_NODE_FIELDS

#define l_left   link[0]
#define l_right  link[1]
};

/*
 * Macro that defines all fields in a route node.
 */
#define ROUTE_NODE_FIELDS                                                      \
	/* Actual prefix of this radix. */                                     \
	struct prefix p;                                                       \
                                                                               \
	/* Tree link. */                                                       \
	struct route_table *table_rdonly(table);                               \
	struct route_node *table_rdonly(parent);                               \
	struct route_node *table_rdonly(link[2]);                              \
                                                                               \
	/* Lock of this radix */                                               \
	unsigned int table_rdonly(lock);                                       \
                                                                               \
	struct rn_hash_node_item nodehash;                                     \
	/* Each node of route. */                                              \
	void *info;//可以是struct interface，struct ospf_area_range，struct ospf_route，struct ospf_neighbor，rib_dest_t_等，基本是和route_entry及address相关的

```

### struct route_entry

```
struct route_entry {
	/* Link list. */
    //用于将当前 route entry 结构维护在链表中，由于路由表可能包含许多路由条目，因此需要一种方法来链接和跟踪它们，这就是使用链表的原因
	struct re_list_item next;//kalipy ze li yon lai zuo sen me de?

	/* Nexthop group, shared/refcounted, based on the nexthop(s)
	 * provided by the owner of the route
	 */
    //当前路由条目的下一跳信息，这是一个 nexthop_group 对象， 具体表示路由中使用的下一跳地址集合
    //在路由表中，每个路由条目可能包含多个 nexthop，因此需要使用哈希表来管理它们
    //这个哈希表使用共享引用计数技术（shared/refcounted），这意味着多个路由条目可能引用相同的 nexthop
	struct nhg_hash_entry *nhe;
    /*
    /*
     * Hashtables containing nhg entries is in `zebra_router`.
     */
    struct nhg_hash_entry {
    	uint32_t id;//下一跳组的标识符
    	afi_t afi;//地址家族标识符
    	vrf_id_t vrf_id;//虚拟路由器的ID
    
    	/* Time since last update */
    	time_t uptime;//自上次更新以来的时间
    
    	/* Source protocol - zebra or another daemon */
    	int type;//源协议，是来自zebra还是另一个守护进程
    
    	/* zapi instance and session id, for groups from other daemons */
    	uint16_t zapi_instance;
    	uint32_t zapi_session;
    
    	struct nexthop_group nhg;//包含下一跳列表的下一跳组结构
        /*
        /*
         * What is a nexthop group?
         *
         * A nexthop group is a collection of nexthops that make up
         * the ECMP path for the route.
         *
         * This module provides a proper abstraction to this idea.
         */
        //这个结构体可以用于在网络路由、负载均衡等场景中，管理和维护多个 nexthops 组成的路径，确保数据的顺畅传递。
        struct nexthop_group {
        	struct nexthop *nexthop;
        
        	struct nhg_resilience nhgr;
        };
        它表示一组 nexthops （下一跳）集合，这些下一跳组成了一条等价多路径（ECMP）路由。
        
        nexthop_group是用于网络路由的抽象数据类型。网络路由中涉及到的 Nexthop 信息通常非常复杂，同一个路由下的 Nexthop 可能有很多个，成为 Nexthop 组。这个结构体封装了一些信息和逻辑来描述和管理这组 Nexthops。
        
        nexthop_group中包含了 nexthop 和 nhgr 两个成员：
        
            nexthop 是一个指针成员，它指向一个 struct nexthop 结构体，表示 Nexthop 组中的一个下一跳；
            nhgr 是一个结构体，表示 Nexthop 组的冗余备份信息。它包含了指向 nhg_hash_entry 结构体的指针，用于维护备份 nexthops 的信息。
        
        //它用于表示 Nexthop 组的容错备份信息。
        struct nhg_resilience {
        	uint16_t buckets;
        	uint32_t idle_timer;
        	uint32_t unbalanced_timer;
        	uint64_t unbalanced_time;
        };
        
        这个结构体包含了以下成员：
        
            buckets 表示 nhg_hash 的哈希表桶的数量。nhg_hash 是一个哈希表，用于存储备份 nexthops 的信息。通过在哈希表中分散存储这些信息，提高了备份 nexthops 的查找效率和速度。
            idle_timer 表示备份 nexthops 的最大空闲时间，单位为秒。当备份 nexthops 空闲时间超过 idle_timer 时，它们将被删除。
            unbalanced_timer 表示备份 nexthops 不平衡的最大时间，单位为秒。当 Nexthop 组出现不平衡（即某些 nexthops 负载过重，导致传输不均衡）时，备份 nexthops 将被调用来解决问题。当备份 nexthops 被调用时，它们将置于活动状态，并计时 unbalanced_timer。当计时时间超过该阈值时，备份 nexthops 将被删除。
            unbalanced_time 表示最近一次 Nexthop 组出现不平衡的时间点。当 Nexthop 组出现不平衡时，此成员将记录当前时间，并在备份 nexthops 处理完成后被更新。
        
        这个结构体用于维护 Nexthop 组的冗余备份信息，确保在 Nexthop 组出现问题时可以快速、可靠地进行调整和处理。
        */
    
    	/* If supported, a mapping of backup nexthops. */
        //备用下一跳的映射（如果支持）
    	struct nhg_backup_info *backup_info;
        /*
        备份（或备用）下一跳的映射用于在主要下一跳失效时提供替代路径。如果主要下一跳无法传输数据包，则可以通过备份映射中列出的备份下一跳路由器发送数据包。这可以提供冗余和更好的网络可靠性，以确保网络的高可用性。在这个数据结构中，备份下一跳的映射存储在struct nhg_backup_info *backup_info字段中

        /*
         * Backup nexthops: this is a group object itself, so
         * that the backup nexthops can use the same code as a normal object.
         */
        //它包含一个指向 nhg_hash_entry 结构体的指针成员 nhe。这个结构体用来备份下一跳（nexthop）信息，因为备份的下一跳需要使用与正常对象相同的代码，所以它属于一个组对象
        struct nhg_backup_info {
        	struct nhg_hash_entry *nhe;
        }
        */
    
    	/* If this is not a group, it
    	 * will be a single nexthop
    	 * and must have an interface
    	 * associated with it.
    	 * Otherwise, this will be null.
    	 */
        //如果不是下一跳组，则必须关联接口的单个下一跳。否则，这将为null
    	struct interface *ifp;
    
    	uint32_t refcnt;//下一跳组的引用计数器
    	uint32_t dplane_ref;//数据平面的引用计数器
    
    	uint32_t flags;//定义下一跳组状态的附加标志
    
    	/* Dependency trees for other entries.
    	 * For instance a group with two
    	 * nexthops will have two dependencies
    	 * pointing to those nhg_hash_entries.
    	 *
    	 * Using a rb tree here to make lookups
    	 * faster with ID's.
    	 *
    	 * nhg_depends the RB tree of entries that this
    	 * group contains.
    	 *
    	 * nhg_dependents the RB tree of entries that
    	 * this group is being used by
    	 *
    	 * NHG id 3 with nexthops id 1/2
    	 * nhg(3)->nhg_depends has 1 and 2 in the tree
    	 * nhg(3)->nhg_dependents is empty
    	 *
    	 * nhg(1)->nhg_depends is empty
    	 * nhg(1)->nhg_dependents is 3 in the tree
    	 *
    	 * nhg(2)->nhg_depends is empty
    	 * nhg(3)->nhg_dependents is 3 in the tree
    	 */
    	struct nhg_connected_tree_head nhg_depends, nhg_dependents;
        /*
        这是一个依赖树的数据结构，用于跟踪一个下一跳组依赖于哪些其他下一跳组或单个下一跳。这个结构包含两个树：nhg_depends和nhg_dependents。
        
            nhg_depends是包含其下一跳依赖的树，其中每个节点都是一个下一跳组或单个下一跳。例如，如果下一跳组A包含两个下一跳B和C，则节点A会有两个子节点，分别是B和C。
            nhg_dependents是包含依赖于该下一跳组的其他下一跳组或单个下一跳的树。例如，如果下一跳D依赖于下一跳组A，则节点D是节点A的子节点。
        
        这种结构允许程序在查找依赖项时，以更有效的方式遍历这些依赖项，并且以更少的时间和资源找到所需的下一跳组。这种数据结构目的是在程序中更快速和有效地管理下一跳组，并确保网络中跨多个下一跳的数据包传输是可靠的。

        为什么要跟踪一个下一跳组依赖于哪些其他下一跳组或单个下一跳?

        跟踪下一跳组依赖于哪些其他下一跳组或单个下一跳的原因是在更新和删除下一跳组时，需要找出以其为依赖项和以其为依赖项的其他下一跳组和单个下一跳。非常复杂的网络可以有许多下一跳组和路由，长时间运行的网络可能会导致在更新和删除下一跳组时产生混淆和错误。

        路由优化：了解一个下一跳组所依赖的其他下一跳组或单个下一跳可以帮助优化路由选择，从而使流量能够更快地到达目标节点，提高网络资源的利用率。
    
        故障排除：通过跟踪依赖关系，可以快速定位和解决网络中出现的故障，提高网络的可用性和稳定性。
    
        安全性：了解网络中各个节点之间的依赖关系可以帮助识别潜在的网络威胁和攻击来源，为网络安全提供保障。
    
        预测和规划：通过跟踪下一跳组的依赖关系，可以获得有关网络流量和未来需求的洞察，从而更好地进行网络规划和发展，确保网络能够为业务需求提供支持。
        */
    
    	struct thread *timer;
    
    /*
     * Is this nexthop group valid, ie all nexthops are fully resolved.
     * What is fully resolved?  It's a nexthop that is either self contained
     * and correct( ie no recursive pointer ) or a nexthop that is recursively
     * resolved and correct.
     */
    #define NEXTHOP_GROUP_VALID (1 << 0)
    /*
     * Has this nexthop group been installed?  At this point in time, this
     * means that the data-plane has been told about this nexthop group
     * and it's possible usage by a route entry.
     */
    #define NEXTHOP_GROUP_INSTALLED (1 << 1)
    /*
     * Has the nexthop group been queued to be send to the FIB?
     * The NEXTHOP_GROUP_VALID flag should also be set by this point.
     */
    #define NEXTHOP_GROUP_QUEUED (1 << 2)
    /*
     * Is this a nexthop that is recursively resolved?
     */
    #define NEXTHOP_GROUP_RECURSIVE (1 << 3)
    
    /*
     * Backup nexthop support - identify groups that are backups for
     * another group.
     */
    #define NEXTHOP_GROUP_BACKUP (1 << 4)
    
    /*
     * The NHG has been release by an upper level protocol via the
     * `zebra_nhg_proto_del()` API.
     *
     * We use this flag to track this state in case the NHG is still being used
     * by routes therefore holding their refcnts as well. Otherwise, the NHG will
     * be removed and uninstalled.
     *
     */
    #define NEXTHOP_GROUP_PROTO_RELEASED (1 << 5)
    
    /*
     * When deleting a NHG notice that it is still installed
     * and if it is, slightly delay the actual removal to
     * the future.  So that upper level protocols might
     * be able to take advantage of some NHG's that
     * are there
     */
    #define NEXTHOP_GROUP_KEEP_AROUND (1 << 6)
    
    /*
     * Track FPM installation status..
     */
    #define NEXTHOP_GROUP_FPM (1 << 6)
    };

    NEXTHOP_GROUP_VALID：表示所有下一跳均已完全解析且正确的标志。
    NEXTHOP_GROUP_INSTALLED：表示数据平面已通知该下一跳组的可能路由条目使用情况的标志。
    NEXTHOP_GROUP_QUEUED：表示下一跳组是否已排队发送到FIB的标志。此标志需要设置NEXTHOP_GROUP_VALID。
    NEXTHOP_GROUP_RECURSIVE：表示这是一个递归解析的下一跳的标志。
    NEXTHOP_GROUP_BACKUP：标识为另一组的备份的组的标志。
    NEXTHOP_GROUP_PROTO_RELEASED：表示已通过zebra_nhg_proto_del() API的上层协议释放NHG，并且仍然被路由使用的NHG的标志。
    NEXTHOP_GROUP_KEEP_AROUND：在删除仍然安装的NHG时使用的标志，以便稍微延迟实际删除，以便上层协议可以利用某些NHG。
    NEXTHOP_GROUP_FPM：表示FPM安装状态的标志。

    */

	/* Nexthop group from FIB (optional), reflecting what is actually
	 * installed in the FIB if that differs. The 'backup' group is used
	 * when backup nexthops are present in the route's nhg.
	 */
    //一个表示最佳 nexthop group 的结构体，该结构体存储的是在 Fib 表中最优的 nexthop group
    //目前在 FIB 中安装的下一跳信息，也是一个 nexthop_group 对象， 表示实际安装到操作系统路由表中的下一跳地址集合。可能与 nhe 不同，因为路由条目的下一跳可以有多个
	struct nexthop_group fib_ng;
    //存储的是在 Fib 表中所使用的后备 nexthop group。当主要 nexthop group 不可用时，后备 nexthop group 可以用来替代它
	struct nexthop_group fib_backup_ng;

	/* Nexthop group hash entry IDs. The "installed" id is the id
	 * used in linux/netlink, if available.
	 */
    //一个标识 nhg_hash_entry 的数字 ID。因为多个路由条目可能引用相同的 nexthop，因此需要使用一个 ID 来标识它
	uint32_t nhe_id;
    //该路由条目在 Linux Netlink 中对应的 ID 标识。
    //前在操作系统路由表中安装的 nexthop_group 的唯一标识
	uint32_t nhe_installed_id;

	/* Tag */
    //该字段是一个路由条目的标记（tag），用于为特定的流量指定一个标识符。这个标记可以用来对流量进行分类、跟踪和区分，以便于处理。
	route_tag_t tag;

	/* Uptime. */
    //表示该路由条目已经存活的时间，以秒为单位。这个值可以用来确定路由变化的历史记录，以及路由条目的生命周期
	time_t uptime;

	/* Type of this route. */
    //该路由条目的类型。在路由通信时，有许多不同类型的路由条目，例如：本地路由、远程路由、广播路由等等。通过这个字段，可以方便地区分它们
	int type;

	/* VRF identifier. */
    //表示该路由条目所属的 VRF 标识符。在多个 VRF 中有不同的路由表，因此需要使用 VRF ID 将不同的路由信息隔离开来
	vrf_id_t vrf_id;

	/* Which routing table */
    //该路由条目所属的路由表。在一个 VRF 中，可能存在多个路由表，通过使用 table ID 可以将不同的路由条目放置在正确的路由表中
	uint32_t table;

	/* Metric */
    //该路由条目的度量值（metric）。在使用路由选择协议进行路由选择时，会使用度量值来确定最优的路由条目
	uint32_t metric;

	/* MTU */
    /表示该路由条目所支持的 MTU（Maximum Transmission Unit）值。MTU 是通信网络中的数据报文最大大小/
	uint32_t mtu;
    //该路由条目的下一跳（nexthop）所支持的最大 MTU 值。这个值可以用来确定数据包是否需要进行分片以进行传输。
	uint32_t nexthop_mtu;

	/* Flags of this route.
	 * This flag's definition is in lib/zebra.h ZEBRA_FLAG_* and is exposed
	 * to clients via Zserv
	 */
    //表示该路由条目的标志（flags），它包含了一些关于路由条目状态的信息
    /*
        ROUT_ENTRY_REMOVED：表示该路由条目已经被删除。
        ROUTE_ENTRY_CHANGED：表示该路由条目发生了更改。
        ROUTE_ENTRY_LABELS_CHANGED：表示该路由条目的标签发生了更改。
        ROUTE_ENTRY_QUEUED：表示该路由条目已经在数据平面中被队列化，但尚未安装。
        ROUTE_ENTRY_INSTALLED：表示该路由条目已经在数据平面中被安装。
        ROUTE_ENTRY_FAILED：表示该路由条目在数据平面中安装失败。
        ROUTE_ENTRY_USE_FIB_NHG：表示该路由条目使用了一个与正常 nexthop 不同的 nexthop group。
        ROUTE_ENTRY_ROUTE_REPLACING：表示该路由条目正在被替换
    */
	uint32_t flags;

	/* RIB internal status */
    //该字段表示该路由条目在 RIB 内部的状态。例如，该路由条目是否已删除或发生了更改等
	uint32_t status;
#define ROUTE_ENTRY_REMOVED          0x1
/* The Route Entry has changed */
#define ROUTE_ENTRY_CHANGED          0x2
/* The Label has changed on the Route entry */
#define ROUTE_ENTRY_LABELS_CHANGED   0x4
/* Route is queued for Installation into the Data Plane */
#define ROUTE_ENTRY_QUEUED   0x8
/* Route is installed into the Data Plane */
#define ROUTE_ENTRY_INSTALLED        0x10
/* Route has Failed installation into the Data Plane in some manner */
#define ROUTE_ENTRY_FAILED           0x20
/* Route has a 'fib' set of nexthops, probably because the installed set
 * differs from the rib/normal set of nexthops.
 */
#define ROUTE_ENTRY_USE_FIB_NHG      0x40
/*
 * Route entries that are going to the dplane for a Route Replace
 * let's note the fact that this is happening.  This will
 * be useful when zebra is determing if a route can be
 * used for nexthops
 */
#define ROUTE_ENTRY_ROUTE_REPLACING 0x80

	/* Sequence value incremented for each dataplane operation */
    //该字段表示该路由条目在执行数据平面操作（例如：安装、删除、更改）时的序列值。每执行一次操作，这个值都会自增
	uint32_t dplane_sequence;

	/* Source protocol instance */
    //该字段表示该路由条目的来源协议实例。在与路由选择协议交互时，可能会有多个协议实例在工作，使用 instance ID 可以区分它们之间的不同源
    /*
    路由条目的来源协议实例 什么意思?
    
    路由表可能由多个路由协议（如 OSPF、BGP、RIP 等）填充，这样可以同时提供不同的路径选择和纠错功能。由于存在多个协议实例，因此需要为每个协议实例关联一个唯一的标识符，这就是“来源协议实例”的含义。
    例如，设想一台路由器上运行着两个不同的 OSPF 实例，每个实例使用不同的 -Area ID 来识别其独特的 OSPF 领域。在这种情况下，每个 OSPF 实例都有自己的来源协议实例标识符，这样就可以在路由表中正确地标识出每个来源。
    */
	uint16_t instance;

	/* Distance. */
    //该字段表示该路由条目的距离值（distance）。在使用路由选择协议时，会使用距离值来确定最优的路由条目
	uint8_t distance;

    //该字段是一个不透明指针，用于添加关于该路由条目的附加信息。可以使用这个指针来存储一些与该路由条目相关的扩展信息，例如：路由条目的优先级、标志等等
	struct re_opaque *opaque;
    /*
    struct re_opaque {
    	uint16_t length;
    	uint8_t data[];
    };
    */
};
```

### struct nexthop

```
/* Nexthop structure. */
struct nexthop {
	struct nexthop *next;
	struct nexthop *prev;
    /*
    next 和 prev 是指向结构体 nexthop 的指针成员，表示该 nexthop 所在的链表节点。这些链表节点组成了一个链表用于保存多个 nexthop，以便进行数据传输时的负载均衡。
    */

	/*
	 * What vrf is this nexthop associated with?
	 */
    //表示该 nexthop 所属的虚拟路由（VRF）标识符
	vrf_id_t vrf_id;

	/* Interface index. */
    //表示该 nexthop 所在的网络接口索引号
	ifindex_t ifindex;

	enum nexthop_types_t type;
    /*
    表示该 nexthop 的类型，可以是 FIB nexthop，也可以是 Recursive nexthop

    enum nexthop_types_t {
    	NEXTHOP_TYPE_IFINDEX = 1,  /* Directly connected.  */
    	NEXTHOP_TYPE_IPV4,	 /* IPv4 nexthop.  */
    	NEXTHOP_TYPE_IPV4_IFINDEX, /* IPv4 nexthop with ifindex.  */
    	NEXTHOP_TYPE_IPV6,	 /* IPv6 nexthop.  */
    	NEXTHOP_TYPE_IPV6_IFINDEX, /* IPv6 nexthop with ifindex.  */
    	NEXTHOP_TYPE_BLACKHOLE,    /* Null0 nexthop.  */
    };

    几种不同的下一跳类型：
    
        NEXTHOP_TYPE_IFINDEX：直连接口，表示目标地址和当前主机直接连接，可以直接用于发送数据包。
        NEXTHOP_TYPE_IPV4：IPv4 下一跳地址。
        NEXTHOP_TYPE_IPV4_IFINDEX：IPv4 下一跳地址出接口 ifindex。
        NEXTHOP_TYPE_IPV6：IPv6 下一跳地址。
        NEXTHOP_TYPE_IPV6_IFINDEX：IPv6 下一跳地址出接口 ifindex。
        NEXTHOP_TYPE_BLACKHOLE：黑洞，表示数据包将被丢弃，相当于一个空的下一跳地址。
    */

	uint16_t flags;
    /*
    表示该 nexthop 的一些特性和状态。具体包括：
    
        NEXTHOP_FLAG_ACTIVE 标识该 nexthop 是否是激活状态。
        NEXTHOP_FLAG_FIB 标识该 nexthop 是否是 FIB nexthop。
        NEXTHOP_FLAG_RECURSIVE 标识该 nexthop 是否是 Recursive nexthop。
        NEXTHOP_FLAG_ONLINK 标识该 nexthop 是否应该被安装在本地节点上。
        NEXTHOP_FLAG_DUPLICATE 标识该 nexthop 是否是重复的 nexthop。
        NEXTHOP_FLAG_RNH_FILTERED 标识该 nexthop 在 rmap（route map）中被过滤。
        NEXTHOP_FLAG_HAS_BACKUP 标识该 nexthop 是否具有备份 nexthop。
        NEXTHOP_FLAG_SRTE 标识该 nexthop 是否是 SR-TE（Segment Routing Traffic Engineering）的 nexthop。
        NEXTHOP_FLAG_EVPN 标识该 nexthop 是否是 EVPN 的 nexthop。
        NEXTHOP_FLAG_LINKDOWN 标识该 nexthop 是否会在链路断开后被删除。
    */
#define NEXTHOP_FLAG_ACTIVE     (1 << 0) /* This nexthop is alive. */
#define NEXTHOP_FLAG_FIB        (1 << 1) /* FIB nexthop. */
#define NEXTHOP_FLAG_RECURSIVE  (1 << 2) /* Recursive nexthop. */
#define NEXTHOP_FLAG_ONLINK     (1 << 3) /* Nexthop should be installed
					  * onlink.
					  */
#define NEXTHOP_FLAG_DUPLICATE  (1 << 4) /* nexthop duplicates another
					  * active one
					  */
#define NEXTHOP_FLAG_RNH_FILTERED  (1 << 5) /* rmap filtered, used by rnh */
#define NEXTHOP_FLAG_HAS_BACKUP (1 << 6)    /* Backup nexthop index is set */
#define NEXTHOP_FLAG_SRTE       (1 << 7) /* SR-TE color used for BGP traffic */
#define NEXTHOP_FLAG_EVPN       (1 << 8) /* nexthop is EVPN */
#define NEXTHOP_FLAG_LINKDOWN   (1 << 9) /* is not removed on link down */

#define NEXTHOP_IS_ACTIVE(flags)                                               \
	(CHECK_FLAG(flags, NEXTHOP_FLAG_ACTIVE)                                \
	 && !CHECK_FLAG(flags, NEXTHOP_FLAG_DUPLICATE))

	/* Nexthop address */
	union {
		union g_addr gate;
		enum blackhole_type bh_type;
	};
    /*
    union g_addr {
    	struct in_addr ipv4;
    	struct in6_addr ipv6;
    };
    enum blackhole_type {
    	BLACKHOLE_UNSPEC = 0,
    	BLACKHOLE_NULL,
    	BLACKHOLE_REJECT,
    	BLACKHOLE_ADMINPROHIB,
    };
    不同类型的黑洞路由：
    
        BLACKHOLE_UNSPEC：未指定类型的黑洞路由。
        BLACKHOLE_NULL：空黑洞路由，表示数据包将被丢弃且不反馈 ICMP。
        BLACKHOLE_REJECT：拒绝黑洞路由，表示数据包将被丢弃且反馈相应的 ICMP 拒绝信息。
        BLACKHOLE_ADMINPROHIB：管理员禁止黑洞路由，表示数据包将被丢弃且反馈相应的 ICMP 错误信息，是最严格的黑洞路由类型
    */
	union g_addr src;//表示该 nexthop 的网关地址和源地址
    //表示该 nexthop 的源地址是通过路由映射（route map）设置的
	union g_addr rmap_src; /* Src is set via routemap */

	/* Nexthops obtained by recursive resolution.
	 *
	 * If the nexthop struct needs to be resolved recursively,
	 * NEXTHOP_FLAG_RECURSIVE will be set in flags and the nexthops
	 * obtained by recursive resolution will be added to `resolved'.
	 */
    //指向被递归解析得到的 nexthop，用于实现递归解析的功能
	struct nexthop *resolved;
	/* Recursive parent */
    //表示父级递归 nexthop，如果存在的话
	struct nexthop *rparent;

	/* Type of label(s), if any */
    //表示该 nexthop 所关联的链路状态信息(LSP)类型
    //LSP是网络领域中的一个概念，它是指用于描述网络拓扑状态的信息，帮助路由器动态学习和维护网络拓扑。LSP将网络中的拓扑信息转化为统一的信息格式，便于各节点之间的交换和比较
	enum lsp_types_t nh_label_type;
    /*
    /* LSP types. */
    enum lsp_types_t {
    	ZEBRA_LSP_NONE = 0,   /* No LSP. */
    	ZEBRA_LSP_STATIC = 1, /* Static LSP. */
    	ZEBRA_LSP_LDP = 2,    /* LDP LSP. */
    	ZEBRA_LSP_BGP = 3,    /* BGP LSP. */
    	ZEBRA_LSP_OSPF_SR = 4,/* OSPF Segment Routing LSP. */
    	ZEBRA_LSP_ISIS_SR = 5,/* IS-IS Segment Routing LSP. */
    	ZEBRA_LSP_SHARP = 6,  /* Identifier for test protocol */
    	ZEBRA_LSP_SRTE = 7,   /* SR-TE LSP */
    	ZEBRA_LSP_EVPN = 8,  /* EVPN VNI Label */
    };

    ZEBRA_LSP_NONE：无LSP

    ZEBRA_LSP_STATIC：静态LSP。静态LSP是由网络管理员手动配置的，通常用于小型网络。

    ZEBRA_LSP_LDP：LDP(Labeled Distribution Protocol) LSP。LDP是一种用于在MPLS网络中建立标签转发的协议。LSP表示一个标签转发路径。

    ZEBRA_LSP_BGP：BGP(Border Gateway Protocol) LSP。BGP是一种用于互联网核心路由器之间进行路由信息交换的协议。BGP LSP是指由BGP协议生成的LSP。

    ZEBRA_LSP_OSPF_SR：OSPF段路由LSP。OSPF是一种用于大型企业、运营商网络中的内部网关协议（IGP），它支持SR（Segment Routing）扩展。此类型LSP表示SR扩展中的LSP。

    ZEBRA_LSP_ISIS_SR：ISIS段路由LSP。ISIS也是一种企业、运营商网络中的IGP协议，同时也支持SR扩展。此类型LSP同样表示ISIS协议中的SR LSP。

    ZEBRA_LSP_SHARP：用于测试的协议标识符

    ZEBRA_LSP_SRTE：SR-TE(Segment Routing Traffic Engineering) LSP。SR-TE是在以SR为基础的网络中使用的一个扩展协议，它可以在网络拓扑上指定特定的传输路径。LSP表示SR-TE扩展中的可编程路径。

    ZEBRA_LSP_EVPN：EVPN(Ethernet VPN) VNI标签。EVPN是一种用于虚拟网络中的L2/L3 VPN技术，VPN实现通过使用VXLAN、NVGRE等协议组合。此类型LSP表示EVPN VNI标签。

    */

	/* Label(s) associated with this nexthop. */
	struct mpls_label_stack *nh_label;
    /*
    /* MPLS label value as a 32-bit (mostly we only care about the label value). */
    typedef unsigned int mpls_label_t;
    
    struct mpls_label_stack {
    	uint8_t num_labels;
    	uint8_t reserved[3];
    	mpls_label_t label[0]; /* 1 or more labels */
    };
    */
    /*
    用于 MPLS 中标签的存储和处理：
    
        mpls_label_t: 一个 unsigned int 类型的数据结构，用来存储 MPLS 中的标签值。MPLS 是一种通用的封装协议，它通过在数据包中添加标签来实现数据包的快速转发。MPLS 标签值是一个 32 位的无符号整数，它表示了数据包在 MPLS 网络中下一跳的路由信息。
    
        mpls_label_stack: 一个结构体类型，用于存储 MPLS 标签的堆栈。它由以下几个字段组成：
    
        num_labels: 整数类型，用于表示堆栈中标签个数；
        reserved: 长度为3字节的保留字段，用于对齐结构体；
        label[0]: 一个长度可变的数组，用于存储一个或多个 MPLS 标签。由于使用变长数组，所以此字段称作 “柔性数组”（flexible array）。实际上这个数组会在运行时根据 num_labels 自动分配大小。
    
    MPLS 标签的堆栈由多个标签组成，其中最后一个标签对应了目的地址，而其他的标签用于指定下一个路由器的出接口。这个堆栈被称为 “标签栈”（label stack），在 MPLS 的转发过程中，每个路由器会弹出标签栈的第一个标签，并根据这个标签确定下一个路由器。这种方式可以使得数据包在网络中的转发快速而简洁，同时也保证了灵活性和可扩展性。
    
    综上，MPLS 标签和标签栈是 MPLS 协议中核心的概念，mpls_label_t 和 mpls_label_stack 分别用于存储和处理这些信息，为实现 MPLS 数据包的快速转发提供了基础。
    */

	/* Weight of the nexthop ( for unequal cost ECMP ) */
    //表示该 nexthop 的权重，在进行不等式负载均衡（Unequal Cost Load Balancing）时使用
	uint8_t weight;

	/* Count and index of corresponding backup nexthop(s) in a backup list;
	 * only meaningful if the HAS_BACKUP flag is set.
	 */
    //它们表示该 nexthop 的备份 nexthop 的数量和索引号，只有在该 nexthop 具有备份 nexthop 时才有意义
	uint8_t backup_num;
	uint8_t backup_idx[NEXTHOP_MAX_BACKUPS];

	/* Encapsulation information. */
    //表示该 nexthop 的封装类型
	enum nh_encap_type nh_encap_type;
    //表示该 nexthop 的封装信息，包括 VNI 等
	union {
		vni_t vni;
	} nh_encap;
    /*
    enum nh_encap_type {
    	NET_VXLAN = 100, /* value copied from FPM_NH_ENCAP_VXLAN. */
    };
    VxLAN（Virtual Extensible LAN）是一种虚拟化的扩展局域网技术，通过在基础网络之上建立一个逻辑网络，在二层封装的同时支持VNID，并能够应对大规模数据中心应用需求。在VxLAN中，VNID作为一个网络标识符用于在虚拟网络中唯一标识交换的数据流。
    /* VxLAN Network Identifier - 24-bit (RFC 7348) */
    typedef uint32_t vni_t;
    #define VNI_MAX 16777215 /* (2^24 - 1) */
    */

	/* SR-TE color used for matching SR-TE policies */
    //表示该 nexthop 所使用的 SR-TE 颜色
	uint32_t srte_color;
    /*
    SR-TE颜色是指给不同的数据流打上不同颜色标识（通常用数字表示），这些颜色可能对应不同的服务质量等级（QoS），从而使网络能够对不同的流量进行优化和管理。在SR-TE网络中，通过在SR路径中包括颜色信息，可以根据不同颜色的数据流应用不同的约束和路径选择，从而实现对不同流量的不同处理。
    
    总之，SR-TE颜色用于标识和区分不同的数据流，从而实现网络流量工程和优化的目的。
    */

	/* SRv6 information */
    //指向 SRv6 信息
	struct nexthop_srv6 *nh_srv6;

    /*
    备份 nexthop 和递归 nexthop 的信息是什么，有什么用?
    
    备份 nexthop 和递归 nexthop 是指在网络路由中为增加容错性和负载平衡而使用的两种类型的 Nexthop。
    
    备份 nexthop 是指一个备用的网络下一跳，可用于当主要下一跳不再可用时进行网络流量的转移。备份 nexthop 保持与其主要 nexthop 相同的网络硬件和软件，并根据需要提供流量转移和恢复功能。备份 nexthop 在遇到问题时可以快速地接管主要下一跳的流量，从而增加网络的可靠性和容错性。在代码中，备份 nexthop 的信息可以在结构体 nhg_resilience 和 nexthop 中找到。
    
    递归 nexthop 是指在进行路由解析时，需要通过递归方式找到下一个 hop 的 nexthop。当一个 nexthop 被标记为递归 nexthop 时，它需要在通过路由解析器递归解析下一跳时使用。递归 nexthop 通常是一个虚拟的 nexthop，它负责将 traffic 传递到最终的下一跳。在代码中，递归 nexthop 的信息可以在 nexthop 结构体中找到。
    
    递归下一跳（Recursive Next Hop）是指在网络路由中，为了从一个路由器传递数据包到某个目的地，需要经过的多个中间路由器，而这些中间路由器本身的下一跳并不是最终的目的地，还需要经过其他路由器才能到达目的地。为了解决这个问题，可以使用递归下一跳。
    
    举个例子，在 IP/MPLS 网络中，如果数据包需要被路由转发到远程网络中的某个设备，首先路由器可能需要将数据包发送到特定的下一跳路由器。该下一跳路由器本身也无法直接到达目标设备，因此需要通过下一跳路由器的下一跳路由器来到达目的地。这个过程可能会经过几个层级，直到到达目标设备。
    
    为了实现这种复杂的路由终止，使用递归下一跳。当一个路由器发现它的下一个 hop 是一个递归下一跳时，它将继续从路由表中查找与该递归下一跳关联的下一个 hop，并将查找到的下一跳信息插入到当前路由表项的下一跳列表中。如此反复递归执行，直到找到了最终目标的下一跳，从而将数据包正确地转发到目的地。
    
    递归下一跳常常用于在网络中的多个层次之间进行路由转发，以减少网络延迟并降低网络流量拥塞。同时也可以提高网络的可靠性和弹性
    
    eg.
          R1               R2              R3           Destination
       10.0.0.1       10.0.0.2        192.168.1.1    192.168.2.1
        |                |               |              |
        +----------------+---------------+--------------+
             10.0.0.0/24       10.0.1.0/24    192.168.2.0/24
    
    假设 R1 要将数据包传递到目标地址 192.168.2.1，但由于它不在直接连接的网络中，因此需要使用递归下一跳。
    
    首先，R1 会在路由表中查找到下一跳为 10.0.0.2 的出口路由，但 10.0.0.2 并不是目标地址所在网络的最终下一跳。因此，R1 会在该路由条目中添加一个递归下一跳，对应的下一跳路由器为 10.0.1.1。
    */
};
```

### struct rnh

```
/* Nexthop structure. */
struct rnh {
    //存储关于该路由的多种标志信息，包括是否是直连路由，是否已删除，以及是否应该通过默认路由进行解析等信息
	uint8_t flags;

#define ZEBRA_NHT_CONNECTED 0x1
#define ZEBRA_NHT_DELETED 0x2
#define ZEBRA_NHT_RESOLVE_VIA_DEFAULT 0x4

	/* VRF identifier. */
	vrf_id_t vrf_id;

    //地址族标识，例如IPv4或IPv6
	afi_t afi;
    //子地址族标识，例如单播、多播等
	safi_t safi;

    //序列号，用于后续的路由更新交换以及按时间戳排序
	uint32_t seqno;

    //相关联的路由条目
	struct route_entry *state;
    //存储已解析的目标路由前缀
	struct prefix resolved_route;
    //存储与该路由相关的客户端链表
	struct list *client_list;

	/* pseudowires dependent on this nh */
    //存储该路由相关联的伪线列表，即可用于跨越网络传输数据的虚拟点对点连接
	struct list *zebra_pseudowire_list;

    //每个路由信息都会相应地映射到一个节点上。node字段表示该下一跳路由在路由表中所对应的节点信息
	struct route_node *node;

	/*
	 * if this has been filtered for the client
	 */
    //用于存储码分复用等相关信息。可以针对每个客户端进行过滤
	int filtered[ZEBRA_ROUTE_MAX];

    //存储下一个路由的节点信息，用于存储链表的指针信息，构建路由列表
    //它类似于单向链表的一个节点，每个节点都存储着该路由的信息以及该路由的下一个节点的地址。通过这种方式，可以很快地在路由表中查找某个特定的路由信息，也可以很容易地在路由表中添加或删除一个路由信息
	struct rnh_list_item rnh_list_item;
};
```

