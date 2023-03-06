```
1_op.md

:Author: kalipy
:Email: kalipy@debian
```

### if_up

```
/* Interface is up. */
void if_up(struct interface *ifp, bool install_connected)
{
	struct zebra_if *zif;
	struct interface *link_if;
	struct zebra_vrf *zvrf = ifp->vrf->info;

	zif = ifp->info;
	zif->up_count++;
	frr_timestamp(2, zif->up_last, sizeof(zif->up_last));

	/* Notify the protocol daemons. */
	if (ifp->ptm_enable && (ifp->ptm_status == ZEBRA_PTM_STATUS_DOWN)) {
		flog_warn(EC_ZEBRA_PTM_NOT_READY,
			  "%s: interface %s hasn't passed ptm check",
			  __func__, ifp->name);
		return;
	}
	zebra_interface_up_update(ifp);
    /*
    /* Interface up information. */
    //更新网络接口，并使用已连接到路由器的客户端列表来通知路由器状态更改
    void zebra_interface_up_update(struct interface *ifp)
    {
    	struct listnode *node, *nnode;
    	struct zserv *client;
    
    	if (IS_ZEBRA_DEBUG_EVENT)
    		zlog_debug("MESSAGE: ZEBRA_INTERFACE_UP %s vrf %s(%u)",
    			   ifp->name, ifp->vrf->name, ifp->vrf->vrf_id);
    
        //首先检查PTM状态或PTM启用状态，以确定是否需要通知客户端。然后，它遍历路由器的客户端列表，并向每个客户端发送网络接口更新消息和链接参数
    	if (ifp->ptm_status || !ifp->ptm_enable) {
    		for (ALL_LIST_ELEMENTS(zrouter.client_list, node, nnode,
    				       client)) {
    			/* Do not send unsolicited messages to synchronous
    			 * clients.
    			 */
    			if (client->synchronous)//如果是同步通知，则continue
    				continue;
    
                //异步方式通知，向client列表发送z_if_up消息
    			zsend_interface_update(ZEBRA_INTERFACE_UP,
    					       client, ifp);
                /*
                int zsend_interface_update(int cmd, struct zserv *client, struct interface *ifp)
                {
                	struct stream *s = stream_new(ZEBRA_MAX_PACKET_SIZ);
                
                	zclient_create_header(s, cmd, ifp->vrf->vrf_id);
                	zserv_encode_interface(s, ifp);
                
                	if (cmd == ZEBRA_INTERFACE_UP)
                		client->ifup_cnt++;
                	else
                		client->ifdown_cnt++;
                
                	return zserv_send_message(client, s);
                    /*
                    int zserv_send_message(struct zserv *client, struct stream *msg)
                    {
                    	frr_with_mutex (&client->obuf_mtx) {
                            //互斥放入struct stream_fifo *obuf_fifo;队列buf
                    		stream_fifo_push(client->obuf_fifo, msg);
                    	}
                    
                        //向client中注册write事件
                    	zserv_client_event(client, ZSERV_CLIENT_WRITE);
                        /*
                        static void zserv_client_event(struct zserv *client,
                        			       enum zserv_client_event event)
                        {
                        	switch (event) {
                        	case ZSERV_CLIENT_READ:
                        		thread_add_read(client->pthread->master, zserv_read, client,//kalipy
                        				client->sock, &client->t_read);
                        		break;
                        	case ZSERV_CLIENT_WRITE:
                                //向epoll中的client_sock注册write事件
                        		thread_add_write(client->pthread->master, zserv_write, client,
                        				 client->sock, &client->t_write);
                        		break;
/*消息真正发送的流程：

//把fifo队列中的消息发送出去的过程：
zserv_write(struct thread *thread)-->	/* If we have any data pending, try to flush it first */
                                            //如果有任何待处理的数据，请尝试首先刷新
	                                         switch (buffer_flush_all(client->wb, client->sock))
                                                             |
                                                            \|/
                                                    buffer_flush_available(struct buffer *b, int fd)
                                                             |
                                                            \|/
                                                       writev(fd, iov, iovcnt)

/* If we have any data pending, try to flush it first */
switch (buffer_flush_all(client->wb, client->sock)) {
case BUFFER_ERROR:
	goto zwrite_fail;
case BUFFER_PENDING:
	frr_with_mutex (&client->stats_mtx) {
		client->last_write_time = time_now;
	}
	zserv_client_event(client, ZSERV_CLIENT_WRITE);//如果一直有BUFFER_PENDING之前待处理的消息，则一直zserv_client_evnet(client, write)注册写事件，直到全部处理完为止
	return;
case BUFFER_EMPTY:
	break;
}

消息既然发送出去了，那client肯定会回消息吧，消息怎么被接收到的呢？

消息接收流程，分为client和zserv：

zserv的：

(当收到消息的响应时时)，zebra处理消息:

步骤一(epoll收到read事件)：
static void zserv_read(struct thread *thread)
{
		/* Schedule job to process those packets */
		zserv_event(client, ZSERV_PROCESS_MESSAGES);
}

步骤二：
void zserv_event(struct zserv *client, enum zserv_event event)
{
	switch (event) {
	case ZSERV_ACCEPT:
		thread_add_read(zrouter.master, zserv_accept, NULL, zsock,
				NULL);
		break;
	case ZSERV_PROCESS_MESSAGES:
		thread_add_event(zrouter.master, zserv_process_messages, client,
				 0, &client->t_process);
		break;
	case ZSERV_HANDLE_CLIENT_FAIL:
		thread_add_event(zrouter.master, zserv_handle_client_fail,
				 client, 0, &client->t_cleanup);
	}
}

步骤三：
static void zserv_process_messages(struct thread *thread)
{
		zserv_handle_commands(client, cache);
}

步骤四：
void zserv_handle_commands(struct zserv *client, struct stream_fifo *fifo)
{
		zserv_handlers[hdr.command](client, &hdr, msg, zvrf);
}

步骤五(真正的recv data处理函数)：
void (*const zserv_handlers[])(ZAPI_HANDLER_ARGS) = {
	[ZEBRA_ROUTER_ID_ADD] = zread_router_id_add,
	[ZEBRA_ROUTER_ID_DELETE] = zread_router_id_delete,
	[ZEBRA_INTERFACE_ADD] = zread_interface_add,
	[ZEBRA_INTERFACE_DELETE] = zread_interface_delete,
	[ZEBRA_INTERFACE_SET_PROTODOWN] = zread_interface_set_protodown,
	[ZEBRA_ROUTE_ADD] = zread_route_add,
	[ZEBRA_ROUTE_DELETE] = zread_route_del,
	[ZEBRA_REDISTRIBUTE_ADD] = zebra_redistribute_add,
	[ZEBRA_REDISTRIBUTE_DELETE] = zebra_redistribute_delete,
	[ZEBRA_REDISTRIBUTE_DEFAULT_ADD] = zebra_redistribute_default_add,
	[ZEBRA_REDISTRIBUTE_DEFAULT_DELETE] = zebra_redistribute_default_delete,
}

---

client收到zserv的消息时，client的read处理：

/* Zebra client message read function. */
static void zclient_read(struct thread *thread)
{
    ..
	if (command < array_size(lib_handlers) && lib_handlers[command])
		lib_handlers[command](command, zclient, length, vrf_id);
	if (command < zclient->n_handlers && zclient->handlers[command])
		zclient->handlers[command](command, zclient, length, vrf_id);
}

static zclient_handler *const lib_handlers[] = {
	/* fundamentals */
	[ZEBRA_CAPABILITIES] = zclient_capability_decode,
	[ZEBRA_ERROR] = zclient_handle_error,

	/* VRF & interface code is shared in lib */
	[ZEBRA_VRF_ADD] = zclient_vrf_add,
	[ZEBRA_VRF_DELETE] = zclient_vrf_delete,
	[ZEBRA_INTERFACE_ADD] = zclient_interface_add,
	[ZEBRA_INTERFACE_DELETE] = zclient_interface_delete,
	[ZEBRA_INTERFACE_UP] = zclient_interface_up,
	[ZEBRA_INTERFACE_DOWN] = zclient_interface_down,

	/* BFD */
	[ZEBRA_BFD_DEST_REPLAY] = zclient_bfd_session_replay,
	[ZEBRA_INTERFACE_BFD_DEST_UPDATE] = zclient_bfd_session_update,
};

static int zclient_interface_up(ZAPI_CALLBACK_ARGS)
{
	struct interface *ifp;
	struct stream *s = zclient->ibuf;

	ifp = zebra_interface_state_read(s, vrf_id);

	if (!ifp)
		return 0;

	if_up_via_zapi(ifp);
	return 0;
}

/*
 * Read interface up/down msg (ZEBRA_INTERFACE_UP/ZEBRA_INTERFACE_DOWN)
 * from zebra server.  The format of this message is the same as
 * that sent for ZEBRA_INTERFACE_ADD/ZEBRA_INTERFACE_DELETE,
 * except that no sockaddr_dl is sent at the tail of the message.
 */
struct interface *zebra_interface_state_read(struct stream *s, vrf_id_t vrf_id)
{
	struct interface *ifp;
	char ifname_tmp[INTERFACE_NAMSIZ + 1] = {};

	/* Read interface name. */
	STREAM_GET(ifname_tmp, s, INTERFACE_NAMSIZ);

	/* Lookup this by interface index. */
	ifp = if_lookup_by_name(ifname_tmp, vrf_id);
	if (ifp == NULL) {
		flog_err(EC_LIB_ZAPI_ENCODE,
			 "INTERFACE_STATE: Cannot find IF %s in VRF %d",
			 ifname_tmp, vrf_id);
		return NULL;
	}

	zebra_interface_if_set_value(s, ifp);

	return ifp;
stream_failure:
	return NULL;
}

*/
                        	}
                        }
                        */
                    
                    	return 0;
                    }
                    */
                }
                */
    			zsend_interface_link_params(client, ifp);//类似刚才的分析，不分析，作用是通知所有client更新链路层相关的信息
    		}
    	}
    }
    */

	if_nbr_ipv6ll_to_ipv4ll_neigh_add_all(ifp);
    /*
    //这个函数接受一个指向接口结构体的指针作为参数，并将接口所连接的所有IPv6邻居的IPv6链路本地地址转换为IPv4链路本地地址并添加为IPv4链路本地地址邻居。它通过循环遍历接口连接的IPv6邻居列表，并为每个IPv6邻居调用if_nbr_ipv6ll_to_ipv4ll_neigh_update()函数，这个函数将IPv6邻居的IPv6链路本地地址转换为IPv4链路本地地址，并添加为IPv4本地邻居。该程序主要是为使用IPv4进行通信的邻居添加IPv4本地邻居
    static void if_nbr_ipv6ll_to_ipv4ll_neigh_add_all(struct interface *ifp)
    {
    	if (listhead(ifp->nbr_connected)) {
    		struct nbr_connected *nbr_connected;
    		struct listnode *node;
    
    		for (ALL_LIST_ELEMENTS_RO(ifp->nbr_connected, node,
    					  nbr_connected))
    			if_nbr_ipv6ll_to_ipv4ll_neigh_update(
    				ifp, &nbr_connected->address->u.prefix6, 1);
                /*
                void if_nbr_ipv6ll_to_ipv4ll_neigh_update(struct interface *ifp,
                					  struct in6_addr *address, int add)
                {
                
                	char mac[6];
                
                    //这个函数接受一个指向接口结构体的指针，一个IPv6地址和一个整数变量作为参数。当add变量为TRUE（非0）时，它将根据此IPv6地址更新（添加）接口的IPv4邻居表（属性）中的IPv4本地邻居（此处将IPv6地址转换为MAC地址，然后将MAC地址转换为IPv4地址）。当add变量为FALSE（0）时，它将从邻居表中删除对应的IPv4本地邻居。
                	ipv6_ll_address_to_mac(address, (uint8_t *)mac);
                    //这个函数内部调用了ipv6_ll_address_to_mac()函数，将IPv6链路本地地址转换为MAC地址。然后将得到的MAC地址传递给if_nbr_mac_to_ipv4ll_neigh_update()函数，这个函数将MAC地址转换为IPv4地址，并在IPv4邻居表中添加或删除IPv4本地邻居。这个函数实现的功能是将IPv6链路本地地址转换为IPv4链路本地地址，然后在本地邻居列表中添加或删除IPv4本地邻居
                	if_nbr_mac_to_ipv4ll_neigh_update(ifp, mac, address, add);
                    /*
                    //调用inet_pton()函数，将IPv4链路本地地址转换为网络字节序格式并存储在名为ipv4_ll的变量中。然后，首先删除任何现有的与给定地址匹配的IPv4本地邻居条目，因为Netlink当前不提供更新消息类型。然后，通过调用kernel_neigh_update()函数将新条目添加到IPv4邻居表中。
                    
                    //接下来，如果工作仍然处于添加模式，则将v6_2_v4_ll_neigh_entry设置为TRUE，表示这是一个新的v6到v4本地邻居条目，如果是删除模式则不需要此功能。最后，将数据复制到响应的变量中并更新zvrf->neigh_updates以跟踪对邻居表做的更改
                    void if_nbr_mac_to_ipv4ll_neigh_update(struct interface *ifp,
                    				       char mac[6],
                    				       struct in6_addr *address,
                    				       int add)
                    {
                    	struct zebra_vrf *zvrf = ifp->vrf->info;
                    	struct zebra_if *zif = ifp->info;//拿到外层包装类
                    	char buf[16] = "169.254.0.1";
                    	struct in_addr ipv4_ll;
                    	ns_id_t ns_id;
                    
                        //将IPv4链路本地地址转换为网络字节序格式并存储在名为ipv4_ll
                    	inet_pton(AF_INET, buf, &ipv4_ll);
                    
                    	ns_id = zvrf->zns->ns_id;
                    
                    	/* netlink没有update接口，所以先delete，在add
                    	 * Remove and re-add any existing neighbor entry for this address,
                    	 * since Netlink doesn't currently offer update message types.
                    	 */
                    	kernel_neigh_update(0, ifp->ifindex, (void *)&ipv4_ll.s_addr, mac, 6,
                    			    ns_id, AF_INET, true);//kalipy
                    
                    	/*即使当前邻居条目与新添加的条目相同，该函数仍将强制进行安装。这是因为该函数用于刷新接口上MAC条目，在接口故障后使用，如果不强制设置PERMANENT或REACHABLE状态的自定义条目，内核将尝试解决残留的条目，失败，标记为不可达，然后它们对我们将是无用的。 所以此处强制安装新的自定义邻居条目以确保它们被正确添加到IPv4邻居表中
                         *   Add new neighbor entry.
                    	 *
                    	 * We force installation even if current neighbor entry is the same.
                    	 * Since this function is used to refresh our MAC entries after an
                    	 * interface flap, if we don't force in our custom entries with their
                    	 * state set to PERMANENT or REACHABLE then the kernel will attempt to
                    	 * resolve our leftover entries, fail, mark them unreachable and then
                    	 * they'll be useless to us.
                    	 */
                    	if (add)
                            //todo(netlink消息解析):最终调用的是netlink_talk_info()-->netlink_send_msg()-->sendmsg(nl->sock, &msg, 0)-->netlink_parse_info()-->netlink_recv_msg()-->recv(nl->sock, NULL, 0, MSG_PEEK | MSG_TRUNC)
                    		kernel_neigh_update(add, ifp->ifindex, (void *)&ipv4_ll.s_addr,
                    				    mac, 6, ns_id, AF_INET, true);
                    
                        //这里的mac是从netlink中响应过来的数据?
                    	memcpy(&zif->neigh_mac[0], &mac[0], 6);
                    
                    	/*
                    	 * We need to note whether or not we originated a v6
                    	 * neighbor entry for this interface.  So that when
                    	 * someone unwisely accidentally deletes this entry
                    	 * we can shove it back in.
                    	 */
                    	zif->v6_2_v4_ll_neigh_entry = !!add;
                    	memcpy(&zif->v6_2_v4_ll_addr6, address, sizeof(*address));
                    
                    	zvrf->neigh_updates++;//邻居更新数++
                    }

                    */
                }
                    
                */
    	}
    }
    */

	rtadv_if_up(zif);

	/* Install connected routes to the kernel. */
    //安装连接路由到kernel
	if (install_connected)
        /*
        连接路由和直连路由是一个东西吗?
        
        不是完全相同的概念。
        
            “连接路由”通常指的是路由器通过物理的有线或无线连接将计算机、手机、智能家居等设备连接到Internet或内部网络中。连接路由器有时也被称为“有线/无线路由器”或“家用路由器”等。
            “直连路由”则可以解释为路由器与Internet服务提供商（ISP）之间的连接类型。如果使用直接连接路由，则路由器相当于直接与ISP通信，而不需要经过其他设备（比如调制解调器）。这样可以提高Internet连接速度和稳定性。直连路由通常也称为“无线宽带路由器”或“光纤路由器”。
        
        因此，连接路由和直连路由虽然都与路由器有关系，但是指代的是不同的概念。

        connected route是连接路由还是直连路由?
        
        在网络管理中，"connected route"通常指的是与路由器上的接口直接连接的网络，例如路由器的一个接口连接了一个局域网，则该局域网的IP地址范围被视为一个“connected route”。因此，“connected route” 更偏向于连接路由的概念。

        在网络路由中，Connected Route（直连路由）是一种非常重要的路由类型，它是指到达目的地网络所需的下一跳路由器是目的地网络的一部分，也就是说目的地网络直接连接到了本地路由器的网络接口。
        
        举个例子，一台计算机连接到互联网，其 IP 地址为 192.168.1.1，子网掩码为 255.255.255.0。在这种情况下，与计算机直接相连的网络接口为 192.168.1.0/24 网络（也被称为本地网），路由器上将自动配置这个接口的地址，并将其添加到本地路由表中。当出现从计算机到本地网络流量的传输时，路由器将直接将数据包转发到本地网络接口，从而实现本地直连路由。
        
        此外，连接路由还有一个比较重要的作用，那就是它是动态路由协议的重要组成部分。当网络接口被配置后，路由器可以自动将其信息发送给网络协议栈，这使得路由器能够确定那些网络是直接连接的，可以通过最短路径进行访问。
        
        连接路由已经成为网络路由中一个非常常见和重要的部分，几乎每个网络路由设备都会自动创建一些直连路由。它们不仅提供了最短路由的优化选择，而且还可以自动管理局域网络的配置，从而有效地降低了网络的管理和维护成本

        连接路由在路由表中具有很高的优先级，因此通常在处理流量时首先匹配连接路由，然后再匹配其他路由，例如静态路由或动态路由。当网络接口启动时，设备会在路由表中添加相应的连接路由信息，当接口关闭时，设备会将相关的连接路由信息从路由表中删除

        举例说明什么是连接路由和静态路由和动态路由，并解释三者区别:
        
        好的，比如我们有一个网络设备，它连接了两个子网，其中一个子网的 IP 地址范围是 192.168.0.0/24，另一个子网的 IP 地址范围是 192.168.1.0/24。我们需要确保从子网 1 到子网 2 的流量能够正确地路由。下面就来详细说明连接路由、静态路由和动态路由是如何实现的。
        
            连接路由
        
        当网络设备启动时，会自动分配一个 IP 地址，并同时添加一个叫做“连接路由”的路由表项目。这个连接路由项定义了路由目标为“这个设备所连接的网络”时，数据包该如何被发送。在这个例子中，由于网络设备连接了两个子网，因此它会自动生成两个连接路由项，用于映射每个子网。
        
        对于子网 1，设备会添加一个连接路由项：目标为 192.168.0.0/24，下一跳为它自己，因为它已经连接到这个子网。
        
        对于子网 2，设备会添加一个连接路由项：目标为 192.168.1.0/24，下一跳为它自身。
        
        连接路由提供了一种无需手动配置路由表就能实现基本路由的机制。如果设备上有多个网络接口，每个接口都会维护一个连接路由，这样可以确保每个接口的数据包都能够正确地被路由。
        
            静态路由
        
        如果我们需要自定义路由规则，那么就需要使用静态路由。静态路由是管理员手动对路由表进行配置的一种方法，通过静态路由，我们可以控制如何将数据包发送到目标网络。
        
        在本例中，我们可以通过配置一个静态路由，在目标为 192.168.1.0/24 的数据包到达时向设备的另一个子网发送数据包。这可以通过添加一项静态路由表项完成，例如：
        
        目标：192.168.1.0/24
        
        下一跳：192.168.0.1
        
        此时，数据包将被路由到下一跳 192.168.0.1，再由下一跳路由器进行进一步的转发。
        
        静态路由提供了一种手动控制路由表行为的方式，可以用于实现一些特殊需求。但静态路由的缺点是不会自动适应网络的变化，如果网络拓扑发生变化，则需要手动更新路由表。
        
            动态路由
        
        如果我们希望网络能够动态适应网络拓扑的变化，就可以使用动态路由。通过动态路由协议，网络设备能够自动发现和学习其他路由器的信息，并利用这些信息更新自己的路由表。
        
        在上述例子中，如果我们使用动态路由协议，设备就可以自动了解到其连接的其他子网和其他路由器的信息，自动更新它自己的路由表。例如，如果我们启用了 RIP 动态路由协议并加入到两个子网中，在设备启动后，它就将能够自动学习到其它子网有哪些路由器，并将这些信息添加到自己的路由表中。
        
        动态路由提供了一种自动学习和适应网络拓扑变化的方式，可以大大减少路由表维护的工作量。但是它的缺点在于，动态路由需要一定的网络带宽和计算资源，否则可能对网络性能产生负面影响。
        */
		if_install_connected(ifp);
        /*
        /* Install connected routes corresponding to an interface. */
        //安装与接口对应的连接路由
        /*
            遍历接口下的所有连接
            对于每个连接，检查其是否属于连接实际存在的标志 (ZEBRA_IFC_REAL)，若是，则添加或更新zebra 接口地址
            将接口和连接传递给 connected_up 函数， 以触发连接的激活过程。
        
        总之，这个函数是用来设置连接路由表的函数，并通过 connected_up 函数确保它们处于活动状态
        */
        static void if_install_connected(struct interface *ifp)
        {
        	struct listnode *node;
        	struct listnode *next;
        	struct connected *ifc;
        
        	if (ifp->connected) {
        		for (ALL_LIST_ELEMENTS(ifp->connected, node, next, ifc)) {
        			if (CHECK_FLAG(ifc->conf, ZEBRA_IFC_REAL))
        				zebra_interface_address_add_update(ifp, ifc);
                        /*
                        /* Interface address addition. */
                        /*
                       添加或更新指定接口上的连接地址。如果该地址表示实际存在的接口地址，则会向与Zebra路由守护程序连接的客户端发送消息，告知它们该接口地址的添加或更新
                        */
                        void zebra_interface_address_add_update(struct interface *ifp,
                        					struct connected *ifc)
                        {
                        	struct listnode *node, *nnode;
                        	struct zserv *client;
                        
                        	if (IS_ZEBRA_DEBUG_EVENT)
                        		zlog_debug(
                        			"MESSAGE: ZEBRA_INTERFACE_ADDRESS_ADD %pFX on %s vrf %s(%u)",
                        			ifc->address, ifp->name, ifp->vrf->name,
                        			ifp->vrf->vrf_id);
                        
                            //检查连接是否为实际可用连接，如果不是则发出警告。
                        	if (!CHECK_FLAG(ifc->conf, ZEBRA_IFC_REAL))
                        		flog_warn(
                        			EC_ZEBRA_ADVERTISING_UNUSABLE_ADDR,
                        			"advertising address to clients that is not yet usable.");
                        
                            //添加GWMACIP映射；
                        	zebra_vxlan_add_del_gw_macip(ifp, ifc->address, 1);
                        
                            //向路由器标识符添加一个IP地址 ???
                        	router_id_add_address(ifc);
                            /*
                            void router_id_add_address(struct connected *ifc)
                            {
                            	struct list *l = NULL;
                            	struct listnode *node;
                            	struct prefix before;
                            	struct prefix after;
                            	struct zserv *client;
                            	struct zebra_vrf *zvrf = ifc->ifp->vrf->info;
                            	afi_t afi;
                            	struct list *rid_lo;
                            	struct list *rid_all;
                            
                            	if (router_id_bad_address(ifc))
                            		return;
                            
                            	switch (ifc->address->family) {
                            	case AF_INET:
                            		afi = AFI_IP;
                            		rid_lo = zvrf->rid_lo_sorted_list;
                            		rid_all = zvrf->rid_all_sorted_list;
                            		break;
                            	case AF_INET6:
                            		afi = AFI_IP6;
                            		rid_lo = zvrf->rid6_lo_sorted_list;
                            		rid_all = zvrf->rid6_all_sorted_list;
                            		break;
                            	default:
                            		return;
                            	}
                            
                            	router_id_get(afi, &before, zvrf);
                            
                            	l = if_is_loopback(ifc->ifp) ? rid_lo : rid_all;
                            
                            	if (!router_id_find_node(l, ifc))
                            		listnode_add_sort(l, ifc);
                            
                            	router_id_get(afi, &after, zvrf);
                            
                            	if (prefix_same(&before, &after))
                            		return;
                            
                            	for (ALL_LIST_ELEMENTS_RO(zrouter.client_list, node, client))
                            		zsend_router_id_update(client, afi, &after, zvrf_id(zvrf));//kalipy
                            }

                            首先判断了地址类型（IPv4或IPv6），然后调用了“router_id_bad_address”函数来检查该地址是否可用。如果可用，则获取特定AFI的路由器标识符（router ID）并将其存储在“before”变量中。
                            
                            然后需要将该地址添加到“rid_lo”或“rid_all”列表中，“rid_lo”列表是指“loopback”接口（即回环接口），而“rid_all”列表包含所有接口的标识符。
                            
                            接着，如果该接口在列表中不存在，则将其添加到列表中。接下来，再次获取路由器标识符，在此时，如果在添加该接口后，标识符发生了更改，则向zrouter.client_list中的所有客户端发送路由器标识符更新通知。
                            
                            总之，这个函数的作用是为给定接口的IP地址添加路由器标识符，并在触发条件下向客户端发送更新通知
                            */
                        
                            //遍历所有与Zebra路由守护程序连接的客户端，并向它们发送添加或更新接口地址的消息
                        	for (ALL_LIST_ELEMENTS(zrouter.client_list, node, nnode, client)) {
                        		/* Do not send unsolicited messages to synchronous clients. */
                        		if (client->synchronous)
                        			continue;
                                //异步通知所有client
                        		if (CHECK_FLAG(ifc->conf, ZEBRA_IFC_REAL)) {
                        			client->connected_rt_add_cnt++;
                                    //注册ZEBRA_INTERFACE_ADDRESS_ADD事件，依次调用int zserv_send_message(struct zserv *client, struct stream *msg)-->zserv_client_event(client, ZSERV_CLIENT_WRITE);
                        			zsend_interface_address(ZEBRA_INTERFACE_ADDRESS_ADD,
                        						client, ifp, ifc);
                                    /*
                                    /* Interface address is added/deleted. Send ZEBRA_INTERFACE_ADDRESS_ADD or
                                     * ZEBRA_INTERFACE_ADDRESS_DELETE to the client.
                                     *
                                     * A ZEBRA_INTERFACE_ADDRESS_ADD is sent in the following situations:
                                     * - in response to a 3-byte ZEBRA_INTERFACE_ADD request
                                     *   from the client, after the ZEBRA_INTERFACE_ADD has been
                                     *   sent from zebra to the client
                                     * - redistribute new address info to all clients in the following situations
                                     *    - at startup, when zebra figures out the available interfaces
                                     *    - when an interface is added (where support for
                                     *      RTM_IFANNOUNCE or AF_NETLINK sockets is available), or when
                                     *      an interface is marked IFF_UP (i.e., an RTM_IFINFO message is
                                     *      received)
                                     *    - for the vty commands "ip address A.B.C.D/M [<label LINE>]"
                                     *      and "no bandwidth <1-10000000>", "ipv6 address X:X::X:X/M"
                                     *    - when an RTM_NEWADDR message is received from the kernel,
                                     *
                                     * The call tree that triggers ZEBRA_INTERFACE_ADDRESS_DELETE:
                                     *
                                     *                   zsend_interface_address(DELETE)
                                     *                           ^
                                     *                           |
                                     *          zebra_interface_address_delete_update
                                     *             ^                        ^      ^
                                     *             |                        |      if_delete_update
                                     *             |                        |
                                     *         ip_address_uninstall        connected_delete_ipv4
                                     *         [ipv6_addresss_uninstall]   [connected_delete_ipv6]
                                     *             ^                        ^
                                     *             |                        |
                                     *             |                  RTM_NEWADDR on routing/netlink socket
                                     *             |
                                     *         vty commands:
                                     *     "no ip address A.B.C.D/M [label LINE]"
                                     *     "no ip address A.B.C.D/M"
                                     *     ["no ipv6 address X:X::X:X/M"]
                                     *
                                     */
                                    */
zebra_interface_address_read
                        		}
                        	}
                        }
                        */
        
                    //在连接状态变为“up”(连接激活)时创建连接路由
        			connected_up(ifp, ifc);
/*
/* Called from if_up(). */
void connected_up(struct interface *ifp, struct connected *ifc)
{
	afi_t afi;
	struct prefix p;
	struct nexthop nh = {
		.type = NEXTHOP_TYPE_IFINDEX,
		.ifindex = ifp->ifindex,
		.vrf_id = ifp->vrf->vrf_id,
	};
	struct zebra_vrf *zvrf;
	uint32_t metric;
	uint32_t flags = 0;
	uint32_t count = 0;
	struct listnode *cnode;
	struct connected *c;

	zvrf = ifp->vrf->info;
	if (!zvrf) {
		flog_err(
			EC_ZEBRA_VRF_NOT_FOUND,
			"%s: Received Up for interface but no associated zvrf: %s(%d)",
			__func__, ifp->vrf->name, ifp->vrf->vrf_id);
		return;
	}
    //检查连接地址是否是连接实际存在的标志 (ZEBRA_IFC_REAL). 若不是，直接返回。
	if (!CHECK_FLAG(ifc->conf, ZEBRA_IFC_REAL))
		return;

	/* Ensure 'down' flag is cleared */
	UNSET_FLAG(ifc->conf, ZEBRA_IFC_DOWN);

    //复制连接地址到p变量中
	prefix_copy(&p, CONNECTED_PREFIX(ifc));
    /*
    /* Does the destination field contain a peer address? */
    #define CONNECTED_PEER(C) CHECK_FLAG((C)->flags, ZEBRA_IFA_PEER)
    
    /* Prefix to insert into the RIB */
    #define CONNECTED_PREFIX(C)                                                    \
    	(CONNECTED_PEER(C) ? (C)->destination : (C)->address)
    */

	/* Apply mask to the network. */
    //并应用网络掩码
	apply_mask(&p);

	afi = family2afi(p.family);

	switch (afi) {
	case AFI_IP:
		/*
		 * In case of connected address is 0.0.0.0/0 we treat it tunnel
		 * address.
		 */
		if (prefix_ipv4_any((struct prefix_ipv4 *)&p))
			return;
		break;
	case AFI_IP6:
#ifndef GNU_LINUX
		/* XXX: It is already done by rib_bogus_ipv6 within rib_add */
		if (IN6_IS_ADDR_UNSPECIFIED(&p.u.prefix6))
			return;
#endif
		break;
	case AFI_UNSPEC:
	case AFI_L2VPN:
	case AFI_MAX:
		flog_warn(EC_ZEBRA_CONNECTED_AFI_UNKNOWN,
			  "Received unknown AFI: %s", afi2str(afi));
		return;
		break;
	}

    //设置metric
	metric = (ifc->metric < (uint32_t)METRIC_MAX) ?
				ifc->metric : ifp->metric;

	/*
	 * Since we are hand creating the connected routes
	 * in our main routing table, *if* we are working
	 * in an offloaded environment then we need to
	 * pretend like the route is offloaded so everything
	 * else will work
	 */
	if (zrouter.asic_offloaded)
		flags |= ZEBRA_FLAG_OFFLOADED;

	/*
	 * It's possible to add the same network and mask
	 * to an interface over and over.  This would
	 * result in an equivalent number of connected
	 * routes.  Just add one connected route in
	 * for all the addresses on an interface that
	 * resolve to the same network and mask
	 */
	for (ALL_LIST_ELEMENTS_RO(ifp->connected, cnode, c)) {
		struct prefix cp;

		prefix_copy(&cp, CONNECTED_PREFIX(c));
		apply_mask(&cp);

        //防止重复添加连接路由
		if (prefix_same(&cp, &p) &&
		    !CHECK_FLAG(c->conf, ZEBRA_IFC_DOWN))
			count++;

		if (count >= 2)
			return;
	}

    //创建(更新)连接路由到路由表中
	rib_add(afi, SAFI_UNICAST, zvrf->vrf->vrf_id, ZEBRA_ROUTE_CONNECT, 0,
		flags, &p, NULL, &nh, 0, zvrf->table_id, metric, 0, 0, 0,
		false);
/*
int rib_add(afi_t afi, safi_t safi, vrf_id_t vrf_id, int type,
	    unsigned short instance, uint32_t flags, struct prefix *p,
	    struct prefix_ipv6 *src_p, const struct nexthop *nh,
	    uint32_t nhe_id, uint32_t table_id, uint32_t metric, uint32_t mtu,
	    uint8_t distance, route_tag_t tag, bool startup)
{
	struct route_entry *re = NULL;
	struct nexthop nexthop = {};
	struct nexthop_group ng = {};

	/* Allocate new route_entry structure. */
    //创建一个新的 route_entry 结构体
	re = zebra_rib_route_entry_new(vrf_id, type, instance, flags, nhe_id,
				       table_id, metric, mtu, distance, tag);

	/* If the owner of the route supplies a shared nexthop-group id,
	 * we'll use that. Otherwise, pass the nexthop along directly.
	 */
    //检查该路由是否使用共享的nexthop-group id，如果不是，则直接将该路由根据nexthop，添加到nexthop-group中
	if (!nhe_id) {
		/* Add nexthop. */
		nexthop = *nh;
		nexthop_group_add_sorted(&ng, &nexthop);
	}

    //“rib_add_multipath”函数将路由添加到路由表中。如果' startup '设置为true，则会向协议进程告知（告知），这将触发下一条可用路由的查找和选择。如果未找到路径，则将该路径标记为不可访问
	return rib_add_multipath(afi, safi, p, src_p, re, &ng, startup);
    /*
    /*
     * Add a single route.
     */
    int rib_add_multipath(afi_t afi, safi_t safi, struct prefix *p,
    		      struct prefix_ipv6 *src_p, struct route_entry *re,
    		      struct nexthop_group *ng, bool startup)
    {
    	int ret;
        //用来存储nexthop组信息
        //主要用于维护nexthop组的相关信息，方便在路由表中查找指定的nexthop组信息。在zebra路由器中，这些信息是通过从其他守护进程或路由协议中获取的，并存储在结构体中进行查询和操作
    	struct nhg_hash_entry nhe, *n;
        /*
            /*
             * Hashtables containing nhg entries is in `zebra_router`.
             */
            struct nhg_hash_entry {}
        */
    
    	if (!re)
    		return -1;
    
    	/* We either need nexthop(s) or an existing nexthop id */
    	if (ng == NULL && re->nhe_id == 0)
    		return -1;
    
    	/*
    	 * Use a temporary nhe to convey info to the common/main api.
    	 */
        //接收AFI（IPv4或IPv6）和SAFI（单播或多播）的参数，并使用这些参数构造一个路由条目。它还接收一个“nexthop_group”结构（“ng”参数），以提供多个下一跳路由。它还接收一个bool类型的“startup”参数，用于确定将此路由信息发送给协议进程时是否启动协议（使用hallo包）
    	zebra_nhe_init(&nhe, afi, (ng ? ng->nexthop : NULL));
    	if (ng)
    		nhe.nhg.nexthop = ng->nexthop;
    	else if (re->nhe_id > 0)
    		nhe.id = re->nhe_id;
    
    	n = zebra_nhe_copy(&nhe, 0);
        //然后将这些参数传递给“rib_add_multipath_nhe”函数，函数会将这个多路径路由添加到路由表中。在该操作之前，该函数需要检查是否有一个有效的nexthop路由，如果没有，则返回-1（表示未能成功添加该路由）
    	ret = rib_add_multipath_nhe(afi, safi, p, src_p, re, n, startup);
        /*
        int rib_add_multipath_nhe(afi_t afi, safi_t safi, struct prefix *p,
        			  struct prefix_ipv6 *src_p, struct route_entry *re,
        			  struct nhg_hash_entry *re_nhe, bool startup)
        {
        	struct zebra_early_route *ere;
        
        	if (!re)
        		return -1;
        
        	assert(!src_p || !src_p->prefixlen || afi == AFI_IP6);
        
        	ere = XCALLOC(MTYPE_WQ_WRAPPER, sizeof(*ere));
        	ere->afi = afi;
        	ere->safi = safi;
        	ere->p = *p;
        	if (src_p)
        		ere->src_p = *src_p;
        	ere->src_p_provided = !!src_p;
        	ere->re = re;
        	ere->re_nhe = re_nhe;
        	ere->startup = startup;
        
        	return mq_add_handler(ere, rib_meta_queue_early_route_add);
            /*
            static int mq_add_handler(void *data,
            			  int (*mq_add_func)(struct meta_queue *mq, void *data))
            {
            	if (zrouter.ribq == NULL) {
            		flog_err(EC_ZEBRA_WQ_NONEXISTENT,
            			 "%s: work_queue does not exist!", __func__);
            		return -1;
            	}
            
            	/*
            	 * The RIB queue should normally be either empty or holding the only
            	 * work_queue_item element. In the latter case this element would
            	 * hold a pointer to the meta queue structure, which must be used to
            	 * actually queue the route nodes to process. So create the MQ
            	 * holder, if necessary, then push the work into it in any case.
            	 * This semantics was introduced after 0.99.9 release.
            	 */
            	if (work_queue_empty(zrouter.ribq))
            		work_queue_add(zrouter.ribq, zrouter.mq);
            
            	return mq_add_func(zrouter.mq, data);
            }
            */
            /*
            调用放入队列：
            
            static int rib_meta_queue_early_route_add(struct meta_queue *mq, void *data)
            {
            	struct zebra_early_route *ere = data;
            
            	listnode_add(mq->subq[META_QUEUE_EARLY_ROUTE], data);
            	mq->size++;
            
            	if (IS_ZEBRA_DEBUG_RIB_DETAILED)
            		zlog_debug(
            			"Route %pFX(%u) queued for processing into sub-queue %s",
            			&ere->p, ere->re->vrf_id,
            			subqueue2str(META_QUEUE_EARLY_ROUTE));
            
            	return 0;
            }
            
            最终注册queue事件：
            
            thread_add_event(wq->master, work_queue_run, wq, 0,
            				 &wq->thread);
            
            当队列中收到内容时，处理刚才入队的early_route:
            
            /* timer thread to process a work queue
             * will reschedule itself if required,
             * otherwise work_queue_item_add
             */
            void work_queue_run(struct thread *thread)
            {
             run and take care of items that want to be retried
            		do {
            			ret = wq->spec.workfunc(wq, item->data);//正真处理early_route fifo消息的地方
            			item->ran++;
            		} while ((ret == WQ_RETRY_NOW)
            			 && (item->ran < wq->spec.max_retries));
            
                         /* initialise zebra rib work queue */
                         ..
            }
            
            wq->spec.workfunc是在init时被设置的：
            
            static void rib_queue_init(void)
            {
            	if (!(zrouter.ribq = work_queue_new(zrouter.master,
            					    "route_node processing"))) {
            		flog_err(EC_ZEBRA_WQ_NONEXISTENT,
            			 "%s: could not initialise work queue!", __func__);
            		return;
            	}
            
            	/* fill in the work queue spec */
            	zrouter.ribq->spec.workfunc = &meta_queue_process;//正在的消息处理回调函数，是在rib队列init的时候设置进去的
            	zrouter.ribq->spec.completion_func = NULL;
            	/* XXX: TODO: These should be runtime configurable via vty */
            	zrouter.ribq->spec.max_retries = 3;
            	zrouter.ribq->spec.hold = ZEBRA_RIB_PROCESS_HOLD_TIME;
            	zrouter.ribq->spec.retry = ZEBRA_RIB_PROCESS_RETRY_TIME;
            
            	if (!(zrouter.mq = meta_queue_new())) {
            		flog_err(EC_ZEBRA_WQ_NONEXISTENT,
            			 "%s: could not initialise meta queue!", __func__);
            		return;
            	}
            	return;
            }
            
            处理函数如下，消费我们最早放入的消息(early_route)：
            
            static unsigned int process_subq(struct list *subq,
            				 enum meta_queue_indexes qindex)
            {
            	struct listnode *lnode = listhead(subq);
            
            	if (!lnode)
            		return 0;
            
            	switch (qindex) {
            	case META_QUEUE_EVPN:
            		process_subq_evpn(lnode);
            		break;
            	case META_QUEUE_NHG:
            		process_subq_nhg(lnode);
            		break;
            	case META_QUEUE_EARLY_ROUTE:
            		process_subq_early_route(lnode);//ok，看到了我们最早入队的early_route(connected upate)消息
            		break;
            	case META_QUEUE_EARLY_LABEL:
            		process_subq_early_label(lnode);
            		break;
            	case META_QUEUE_CONNECTED:
            	case META_QUEUE_KERNEL:
            	case META_QUEUE_STATIC:
            	case META_QUEUE_NOTBGP:
            	case META_QUEUE_BGP:
            	case META_QUEUE_OTHER:
            		process_subq_route(lnode, qindex);
            		break;
            	}
            
            	list_delete_node(subq, lnode);//处理完了后，从queue删除
            
            	return 1;
            }
            */
        }
        */
    
    	/* In error cases, free the route also */
        //如果添加路由失败，则函数将释放该正在尝试添加的路由
    	if (ret < 0)
    		XFREE(MTYPE_RE, re);
    
    	return ret;
    }
    */
}
*/

	rib_add(afi, SAFI_MULTICAST, zvrf->vrf->vrf_id, ZEBRA_ROUTE_CONNECT, 0,
		flags, &p, NULL, &nh, 0, zvrf->table_id, metric, 0, 0, 0,
		false);

	/* Schedule LSP forwarding entries for processing, if appropriate. */
	if (zvrf->vrf->vrf_id == VRF_DEFAULT) {
		if (IS_ZEBRA_DEBUG_MPLS)
			zlog_debug(
				"%u: IF %s IP %pFX address add/up, scheduling MPLS processing",
				zvrf->vrf->vrf_id, ifp->name, &p);
		mpls_mark_lsps_for_processing(zvrf, &p);
	}
}
*/
        		}
        	}
        }
        */

	/* Handle interface up for specific types for EVPN. Non-VxLAN interfaces
	 * are checked to see if (remote) neighbor entries need to be installed
	 * on them for ARP suppression.
	 */
    //容易被带偏，暂时不分析vxlan相关的内容
	if (IS_ZEBRA_IF_VXLAN(ifp))
		zebra_vxlan_if_up(ifp);
	else if (IS_ZEBRA_IF_BRIDGE(ifp)) {
		link_if = ifp;
		zebra_vxlan_svi_up(ifp, link_if);
	} else if (IS_ZEBRA_IF_VLAN(ifp)) {
		link_if = if_lookup_by_index_per_ns(zvrf->zns,
						    zif->link_ifindex);
		if (link_if)
			zebra_vxlan_svi_up(ifp, link_if);
	} else if (IS_ZEBRA_IF_MACVLAN(ifp)) {
		zebra_vxlan_macvlan_up(ifp);
	}

	if (zif->es_info.es)
		zebra_evpn_es_if_oper_state_change(zif, true /*up*/);

	if (zif->flags & ZIF_FLAG_EVPN_MH_UPLINK)
		zebra_evpn_mh_uplink_oper_update(zif);

	thread_add_timer(zrouter.master, if_zebra_speed_update, ifp, 0,//kalipy
			 &zif->speed_update);
	thread_ignore_late_timer(zif->speed_update);
}
```

### connected_add_ipv4

```
//添加一个IPv4连接地址(路由)到指定的接口
/* Add connected IPv4 route to the interface. */
void connected_add_ipv4(struct interface *ifp, int flags,
			const struct in_addr *addr, uint16_t prefixlen,
			const struct in_addr *dest, const char *label,
			uint32_t metric)
{
	struct prefix_ipv4 *p;
	struct connected *ifc;

    //检查连接地址是否是martian（保留地址或广播地址），如果是，则直接返回
	if (ipv4_martian(addr))
		return;

	/* Make connected structure. */
    //创建新的 connected 对象
	ifc = connected_new();
	ifc->ifp = ifp;
	ifc->flags = flags;
	ifc->metric = metric;
	/* If we get a notification from the kernel,
	 * we can safely assume the address is known to the kernel */
    //如果从内核接收到通知，则设置 QUEUED 标志。该标志表明该连接已经被内核知晓，并且可以被添加到路由表中
	SET_FLAG(ifc->conf, ZEBRA_IFC_QUEUED);
	if (!if_is_operative(ifp))
		SET_FLAG(ifc->conf, ZEBRA_IFC_DOWN);

	/* Allocate new connected address. */
	p = prefix_ipv4_new();
	p->family = AF_INET;
	p->prefix = *addr;
	p->prefixlen =
        //???为什么ZEBRA_IFA_PEER就设置为32
        //如果指定了连接地址的对等点地址，连接网段的路由目标地址通常会被设置为 IPV4_MAX_BITLEN，即32（在IPv4中），这样可以确保该连接于该地址之间的所有通信都被路由到该连接??
        //在网络协议中，当一个主机与另一个设备进行通信时，这些设备通常在同一个网段中。 一个网段通常包括一组互联的计算机或设备，这些设备可以直接通信，而不需要路由器或交换机的帮助。 在一个网段中，每个设备都有一个唯一的IP地址。 当主机在一个不同的网段上时，数据将通过路由器或交换机路由，以使数据从一个网段中的一个设备到达另一个网段中的设备。为了正确路由到该连接，需要确定连接网段的路由目标。 如果指定了连接地址的对等点地址，则连接网段的路由目标地址应该设置为 IPV4_MAX_BITLEN（即32，在IPv4中），这将确保所有流量都被路由到该连接。这是因为，连接网段的子网掩码要与该连接的地址相同，所以子网掩码是32位
		CHECK_FLAG(flags, ZEBRA_IFA_PEER) ? IPV4_MAX_BITLEN : prefixlen;
	ifc->address = (struct prefix *)p;

	/* If there is a peer address. */
	if (CONNECTED_PEER(ifc)) {
		/* validate the destination address */
		if (dest) {
			p = prefix_ipv4_new();
			p->family = AF_INET;
			p->prefix = *dest;
			p->prefixlen = prefixlen;
            //添加dest地址
			ifc->destination = (struct prefix *)p;

			if (IPV4_ADDR_SAME(addr, dest))
				flog_warn(
					EC_ZEBRA_IFACE_SAME_LOCAL_AS_PEER,
					"interface %s has same local and peer address %pI4, routing protocols may malfunction",
					ifp->name, addr);
		} else {
			zlog_debug(
				"%s called for interface %s with peer flag set, but no peer address supplied",
				__func__, ifp->name);
			UNSET_FLAG(ifc->flags, ZEBRA_IFA_PEER);
		}
	}

	/* no destination address was supplied */
	if (!dest && (prefixlen == IPV4_MAX_BITLEN) && if_is_pointopoint(ifp))
		zlog_debug(
			"PtP interface %s with addr %pI4/%d needs a peer address",
			ifp->name, addr, prefixlen);

	/* Label of this address. */
	if (label)
		ifc->label = XSTRDUP(MTYPE_CONNECTED_LABEL, label);

	/* For all that I know an IPv4 address is always ready when we receive
	 * the notification. So it should be safe to set the REAL flag here. */
	SET_FLAG(ifc->conf, ZEBRA_IFC_REAL);

    //更新指定接口的连接列表，将新创建的连接对象添加到此列表的末尾
	connected_update(ifp, ifc);
    /*
    /* Handle changes to addresses and send the neccesary announcements
     * to clients. */
    //理网络接口地址的变化，并向客户端发送必要的通告。 它检查连接的路由是否相同，如果是，则更新连接的路由信息。 如果连接已更改或新连接已被添加，则向客户端通告它
    static void connected_update(struct interface *ifp, struct connected *ifc)
    {
    	struct connected *current;
    
    	/* Check same connected route. */
    	current = connected_check_ptp(ifp, ifc->address, ifc->destination);
        /*
        /* same, but with peer address */
        /*用于检查点对点连接的路由是否存在。 它接收一个指向网络接口的指针，以及两个网段参数，表示点对点连接的两个地址。在ifp的已连接列表中检查是否存在与给定地址匹配的条目，如果匹配，则返回匹配的连接信息。

具体地说，函数通过遍历指定网络接口的所有已连接列表项，对比每一项的地址是否和输入参数中的源地址一致，并根据目标地址的值（非空表示点对点模式）进一步判断是否有与输入参数匹配的连接路由。该函数返回找到的第一个匹配项的连接信息指针，如果未找到匹配项，则返回空指针
        */
        struct connected *connected_check_ptp(struct interface *ifp,
        				      union prefixconstptr pu,
        				      union prefixconstptr du)
        {
        	const struct prefix *p = pu.p;
        	const struct prefix *d = du.p;
        	struct connected *ifc;
        	struct listnode *node;
        
        	for (ALL_LIST_ELEMENTS_RO(ifp->connected, node, ifc)) {
        		if (!prefix_same(ifc->address, p))
        			continue;
        		if (!CONNECTED_PEER(ifc) && !d)
        			return ifc;
        		if (CONNECTED_PEER(ifc) && d
        		    && prefix_same(ifc->destination, d))
        			return ifc;
        	}
        
        	return NULL;
        }
        */
    	if (current) {
    		if (CHECK_FLAG(current->conf, ZEBRA_IFC_CONFIGURED))
    			SET_FLAG(ifc->conf, ZEBRA_IFC_CONFIGURED);
    
    		/* Avoid spurious withdraws, this might be just the kernel
    		 * 'reflecting'
    		 * back an address we have already added.
    		 */
    		if (connected_same(current, ifc)) {
    			/* nothing to do */
    			connected_free(&ifc);
    			return;
    		}
    
    		/* Clear the configured flag on the old ifc, so it will be freed
    		 * by
    		 * connected withdraw. */
    		UNSET_FLAG(current->conf, ZEBRA_IFC_CONFIGURED);
    		connected_withdraw(
    			current); /* implicit withdraw - freebsd does this */
    	}
    
    	/* If the connected is new or has changed, announce it, if it is usable
    	 */
        //如果连接是新的或者已经改变了，则通告它（向客户端发送更新通告），前提是该连接是可用的
        //ZEBRA_IFC_REAL标志应该仅在该地址存在于内核并且实际可用时设置
    	if (CHECK_FLAG(ifc->conf, ZEBRA_IFC_REAL))
    		connected_announce(ifp, ifc);
            /*
            //用于将已连接的路由信息通告给协议守护进程和其他关注此信息的客户端
            static void connected_announce(struct interface *ifp, struct connected *ifc)
            {
            	if (!ifc)
            		return;
            
                //接下来，如果网络接口不是回环接口且连接信息的地址家族为IPv4，则会根据其掩码长度设置或取消“ZEBRA_IFA_UNNUMBERED”标志位。该标志位指示该连接的地址是否是未编号的
            	if (!if_is_loopback(ifp) && ifc->address->family == AF_INET) {
            		if (ifc->address->prefixlen == IPV4_MAX_BITLEN)
            			SET_FLAG(ifc->flags, ZEBRA_IFA_UNNUMBERED);
            		else
            			UNSET_FLAG(ifc->flags, ZEBRA_IFA_UNNUMBERED);
            	}
            
                //将连接信息添加到网络接口的连接列表中
            	listnode_add(ifp->connected, ifc);
            
            	/* Update interface address information to protocol daemon. */
                //检查连接的地址家族是否为IPv4，如果是，则将接口和连接的信息同步到协议守护进程。特别地，通过调用if_subnet_add函数来处理IPv4地址的子网信息，以确保协议守护进程中的接口与内核中的接口信息保持同步
            	if (ifc->address->family == AF_INET)
                    /*if_subnet_add函数会把接口和连接的信息转换成协议守护进程中可使用的数据格式，并将它们添加到相关数据结构中，以便其他客户端能够查询这些路由信息。例如，如果这个接口连接到的是192.168.1.0/24网段，则协议守护进程将使用这个信息更新它的路由表，告诉其他客户端可以访问到这个网段。

这样，通过将信息同步到协议守护进程中，其他相关的客户端就可以得到及时的路由信息更新。这对于实现多个路由协议之间的互操作性和邻居发现非常重要。
                    */
            		if_subnet_add(ifp, ifc);
                    /*
                    /* Tie an interface address to its derived subnet list of addresses. *
                    int if_subnet_add(struct interface *ifp, struct connected *ifc)
                    {
                    	struct route_node *rn;
                    	struct zebra_if *zebra_if;
                    	struct prefix cp;
                    	struct list *addr_list;
                    
                    	assert(ifp && ifp->info && ifc);
                    	zebra_if = ifp->info;
                    
                    	/* Get address derived subnet node and associated address list, while
                    	   marking
                    	   address secondary attribute appropriately. */
                    	cp = *CONNECTED_PREFIX(ifc);
                        //子网掩码计算出子网地址
                    	apply_mask(&cp);
                        //在ipv4_subnets(route_talbe)中查找是否已存在该子网地址
                    	rn = route_node_get(zebra_if->ipv4_subnets, &cp);
                    
                        //如果已经存在，则将“ZEBRA_IFA_SECONDARY”标记添加到连接信息中
                    	if ((addr_list = rn->info))
                    		SET_FLAG(ifc->flags, ZEBRA_IFA_SECONDARY);
                    	else {
                            //否则创建一个新的子网地址节点，将该节点加入到ipv4_subnets中，并将连接信息添加到与该节点关联的子网地址列表中。同时，将网络接口的子网地址节点进行锁定
                    		UNSET_FLAG(ifc->flags, ZEBRA_IFA_SECONDARY);
                    		rn->info = addr_list = list_new();
                    		route_lock_node(rn);
                    	}
                    
                        //连接信息添加到子网列表的尾部
                    	/* Tie address at the tail of address list. */
                    	listnode_add(addr_list, ifc);
                    
                    	/* Return list element count. */
                        //返回子网地址列表的元素个数
                    	return (addr_list->count);
                    }
                    */
            
                //向协议守护进程发送接口信息更新，之前在if_up中已经分析过了
            	zebra_interface_address_add_update(ifp, ifc);
            
                //如果网络接口处于运行状态，则将连接上线（设置UP标志）
            	if (if_is_operative(ifp)) {
            		connected_up(ifp, ifc);//if_up中分析过了，又是一个非常长的调用链
            	}
            }
            */
    }
    */
}
```

### netlink消息收发处理主要调用链

kernel_init()-->kernel_read()[递归调用，在epoll nlsock_read事件的驱动下！！]-->netlink_parse_info()-->netlink_information_fetch()-->分发到对应的msg_handler中进行处理

吐槽：这里的`kernel_read()-->netlink_parse_info()-->netlink_information_fetch()-->分发到对应的msg_handler中进行处理`的套路，可太熟悉了，`大三嵌入式课`上天天写，只是`kernel_read epoll机制read消息`变成了`网络外设 中断获取消息`！！

kernel_init():

```
//主要是netlink socket初始化(socket setopt bind 设置netlink_recvbuf大小 添加filter函数指针 )，把nlsock放入hash表中

最重要的是这个，先epoll注册netlink nlsocket的read事件，当kernel中netlink有消息过来时，kernel_read会自动被调用：
	thread_add_read(zrouter.master, kernel_read, zns,
			zns->netlink.sock, &zns->t_netlink);
```

kernel_read():

```
//递归调用，在epoll nlsock_read事件的驱动下！！一直调用netlink_parse_info处理kernel发来的netlink消息(因为是在epoll的驱动下kernel_read函数自己递归嘛)
//这个一个"永动机"，只是动力是epoll事件/消息
static void kernel_read(struct thread *thread)
{
	struct zebra_ns *zns = (struct zebra_ns *)THREAD_ARG(thread);
	struct zebra_dplane_info dp_info;

	/* Capture key info from ns struct */
	zebra_dplane_info_from_zns(&dp_info, zns, false);

	netlink_parse_info(netlink_information_fetch, &zns->netlink, &dp_info,
			   5, false);

	thread_add_read(zrouter.master, kernel_read, zns, zns->netlink.sock,
			&zns->t_netlink);
}
```

netlink_parse_info():

```
//对netlink消息的初步处理，主要处理消息头
/*
 * netlink_parse_info
 *
 * Receive message from netlink interface and pass those information
 *  to the given function.
 *
 * filter  -> Function to call to read the results
 * nl      -> netlink socket information
 * zns     -> The zebra namespace data
 * count   -> How many we should read in, 0 means as much as possible
 * startup -> Are we reading in under startup conditions? passed to
 *            the filter.
 */
int netlink_parse_info(int (*filter)(struct nlmsghdr *, ns_id_t, int),
		       struct nlsock *nl, const struct zebra_dplane_info *zns,
		       int count, bool startup)
{
	int status;
	int ret = 0;
	int error;
	int read_in = 0;

	while (1) {
		struct sockaddr_nl snl;
		struct msghdr msg = {.msg_name = (void *)&snl,
				     .msg_namelen = sizeof(snl)};
		struct nlmsghdr *h;

		if (count && read_in >= count)
			return 0;

		status = netlink_recv_msg(nl, &msg);
		if (status == -1)
			return -1;
		else if (status == 0)
			break;

		read_in++;
		for (h = (struct nlmsghdr *)nl->buf;
		     (status >= 0 && NLMSG_OK(h, (unsigned int)status));
		     h = NLMSG_NEXT(h, status)) {
			/* Finish of reading. */
			if (h->nlmsg_type == NLMSG_DONE)
				return ret;

			/* Error handling. */
			if (h->nlmsg_type == NLMSG_ERROR) {
				int err = netlink_parse_error(
					nl, h, zns->is_cmd, startup);

				if (err == 1) {
					if (!(h->nlmsg_flags & NLM_F_MULTI))
						return 0;
					continue;
				} else
					return err;
			}

			/*
			 * What is the right thing to do?  The kernel
			 * is telling us that the dump request was interrupted
			 * and we more than likely are out of luck and have
			 * missed data from the kernel.  At this point in time
			 * lets just note that this is happening.
			 */
			if (h->nlmsg_flags & NLM_F_DUMP_INTR)
				flog_err(
					EC_ZEBRA_NETLINK_BAD_SEQUENCE,
					"netlink recvmsg: The Dump request was interrupted");

			/* OK we got netlink message. */
			if (IS_ZEBRA_DEBUG_KERNEL)
				zlog_debug(
					"%s: %s type %s(%u), len=%d, seq=%u, pid=%u",
					__func__, nl->name,
					nl_msg_type_to_str(h->nlmsg_type),
					h->nlmsg_type, h->nlmsg_len,
					h->nlmsg_seq, h->nlmsg_pid);


			/*
			 * Ignore messages that maybe sent from
			 * other actors besides the kernel
			 */
			if (snl.nl_pid != 0) {
				zlog_debug("Ignoring message from pid %u",
					   snl.nl_pid);
				continue;
			}

			error = (*filter)(h, zns->ns_id, startup);
			if (error < 0) {
				zlog_debug("%s filter function error",
					   nl->name);
				ret = error;
			}
		}

		/* After error care. */
		if (msg.msg_flags & MSG_TRUNC) {
			flog_err(EC_ZEBRA_NETLINK_LENGTH_ERROR,
				 "%s error: message truncated", nl->name);
			continue;
		}
		if (status) {
			flog_err(EC_ZEBRA_NETLINK_LENGTH_ERROR,
				 "%s error: data remnant size %d", nl->name,
				 status);
			return -1;
		}
	}
	return ret;
}
```

netlink_information_fetch():

```
/* 根据netlink_parse_info中解析出来的消息头中的nlmsg_type分发消息，到对应的msg_handler中进行处理
 * Dispatch an incoming netlink message; used by the zebra main pthread's
 * netlink event reader.
 */
static int netlink_information_fetch(struct nlmsghdr *h, ns_id_t ns_id,//kalipy
				     int startup)
{
	/*
	 * When we handle new message types here
	 * because we are starting to install them
	 * then lets check the netlink_install_filter
	 * and see if we should add the corresponding
	 * allow through entry there.
	 * Probably not needed to do but please
	 * think about it.
	 */
	switch (h->nlmsg_type) {
	case RTM_NEWROUTE:
		return netlink_route_change(h, ns_id, startup);
	case RTM_DELROUTE:
		return netlink_route_change(h, ns_id, startup);
	case RTM_NEWLINK:
		return netlink_link_change(h, ns_id, startup);
	case RTM_DELLINK:
		return netlink_link_change(h, ns_id, startup);
	case RTM_NEWNEIGH:
	case RTM_DELNEIGH:
	case RTM_GETNEIGH:
		return netlink_neigh_change(h, ns_id);
	case RTM_NEWRULE:
		return netlink_rule_change(h, ns_id, startup);
	case RTM_DELRULE:
		return netlink_rule_change(h, ns_id, startup);
	case RTM_NEWNEXTHOP:
		return netlink_nexthop_change(h, ns_id, startup);
	case RTM_DELNEXTHOP:
		return netlink_nexthop_change(h, ns_id, startup);
	case RTM_NEWQDISC:
	case RTM_DELQDISC:
		return netlink_qdisc_change(h, ns_id, startup);
	case RTM_NEWTCLASS:
	case RTM_DELTCLASS:
		return netlink_tclass_change(h, ns_id, startup);
	case RTM_NEWTFILTER:
	case RTM_DELTFILTER:
		return netlink_tfilter_change(h, ns_id, startup);
	case RTM_NEWVLAN:
		return netlink_vlan_change(h, ns_id, startup);
	case RTM_DELVLAN:
		return netlink_vlan_change(h, ns_id, startup);

	/* Messages handled in the dplane thread */
	case RTM_NEWADDR:
	case RTM_DELADDR:
	case RTM_NEWNETCONF:
	case RTM_DELNETCONF:
	case RTM_NEWTUNNEL:
	case RTM_DELTUNNEL:
	case RTM_GETTUNNEL:
		return 0;
	default:
		/*
		 * If we have received this message then
		 * we have made a mistake during development
		 * and we need to write some code to handle
		 * this message type or not ask for
		 * it to be sent up to us
		 */
		flog_err(EC_ZEBRA_UNKNOWN_NLMSG,
			 "Unknown netlink nlmsg_type %s(%d) vrf %u",
			 nl_msg_type_to_str(h->nlmsg_type), h->nlmsg_type,
			 ns_id);
		break;
	}
	return 0;
}
```

netlink_route_change():

```
int netlink_route_change(struct nlmsghdr *h, ns_id_t ns_id, int startup)
{
	int len;
	struct rtmsg *rtm;

	rtm = NLMSG_DATA(h);

	if (!(h->nlmsg_type == RTM_NEWROUTE || h->nlmsg_type == RTM_DELROUTE)) {
		/* If this is not route add/delete message print warning. */
		zlog_debug("Kernel message: %s NS %u",
			   nl_msg_type_to_str(h->nlmsg_type), ns_id);
		return 0;
	}

	switch (rtm->rtm_family) {
	case AF_INET:
	case AF_INET6:
		break;

	case RTNL_FAMILY_IPMR:
	case RTNL_FAMILY_IP6MR:
		/* notifications on IPMR are irrelevant to zebra, we only care
		 * about responses to RTM_GETROUTE requests we sent.
		 */
		return 0;

	default:
		flog_warn(
			EC_ZEBRA_UNKNOWN_FAMILY,
			"Invalid address family: %u received from kernel route change: %s",
			rtm->rtm_family, nl_msg_type_to_str(h->nlmsg_type));
		return 0;
	}

	/* Connected route. */
	if (IS_ZEBRA_DEBUG_KERNEL)
		zlog_debug("%s %s %s proto %s NS %u",
			   nl_msg_type_to_str(h->nlmsg_type),
			   nl_family_to_str(rtm->rtm_family),
			   nl_rttype_to_str(rtm->rtm_type),
			   nl_rtproto_to_str(rtm->rtm_protocol), ns_id);


	len = h->nlmsg_len - NLMSG_LENGTH(sizeof(struct rtmsg));
	if (len < 0) {
		zlog_err(
			"%s: Message received from netlink is of a broken size: %d %zu",
			__func__, h->nlmsg_len,
			(size_t)NLMSG_LENGTH(sizeof(struct rtmsg)));
		return -1;
	}

	/* these are "magic" kernel-managed *unicast* routes used for
	 * outputting locally generated multicast traffic (which uses unicast
	 * handling on Linux because ~reasons~.
	 */
	if (rtm->rtm_type == RTN_MULTICAST)
		return 0;

	netlink_route_change_read_unicast(h, ns_id, startup);
    /*
    static int netlink_route_change_read_unicast(struct nlmsghdr *h, ns_id_t ns_id,
    					     int startup)
    {
    	return netlink_route_change_read_unicast_internal(h, ns_id, startup,
    							  NULL);
    }
    */
	return 0;
}

```

netlink_route_change_read_unicast_internal():

```
//真正做解析netlink消息和创建路由的地方
/* Looking up routing table by netlink interface. */
int netlink_route_change_read_unicast_internal(struct nlmsghdr *h,
					       ns_id_t ns_id, int startup,
					       struct zebra_dplane_ctx *ctx)
{
	int len;
	struct rtmsg *rtm;
	struct rtattr *tb[RTA_MAX + 1];
	uint32_t flags = 0;
	struct prefix p;
	struct prefix_ipv6 src_p = {};
	vrf_id_t vrf_id;
	bool selfroute;

	char anyaddr[16] = {0};

	int proto = ZEBRA_ROUTE_KERNEL;
	int index = 0;
	int table;
	int metric = 0;
	uint32_t mtu = 0;
	uint8_t distance = 0;
	route_tag_t tag = 0;
	uint32_t nhe_id = 0;

	void *dest = NULL;
	void *gate = NULL;
	void *prefsrc = NULL; /* IPv4 preferred source host address */
	void *src = NULL;     /* IPv6 srcdest   source prefix */
	enum blackhole_type bh_type = BLACKHOLE_UNSPEC;

	frrtrace(3, frr_zebra, netlink_route_change_read_unicast, h, ns_id,
		 startup);

	rtm = NLMSG_DATA(h);

	if (startup && h->nlmsg_type != RTM_NEWROUTE)
		return 0;
	switch (rtm->rtm_type) {
	case RTN_UNICAST:
		break;
	case RTN_BLACKHOLE:
		bh_type = BLACKHOLE_NULL;
		break;
	case RTN_UNREACHABLE:
		bh_type = BLACKHOLE_REJECT;
		break;
	case RTN_PROHIBIT:
		bh_type = BLACKHOLE_ADMINPROHIB;
		break;
	default:
		if (IS_ZEBRA_DEBUG_KERNEL)
			zlog_debug("Route rtm_type: %s(%d) intentionally ignoring",
				   nl_rttype_to_str(rtm->rtm_type),
				   rtm->rtm_type);
		return 0;
	}

	len = h->nlmsg_len - NLMSG_LENGTH(sizeof(struct rtmsg));
	if (len < 0) {
		zlog_err(
			"%s: Message received from netlink is of a broken size %d %zu",
			__func__, h->nlmsg_len,
			(size_t)NLMSG_LENGTH(sizeof(struct rtmsg)));
		return -1;
	}

	netlink_parse_rtattr(tb, RTA_MAX, RTM_RTA(rtm), len);

	if (rtm->rtm_flags & RTM_F_CLONED)
		return 0;
	if (rtm->rtm_protocol == RTPROT_REDIRECT)
		return 0;
	if (rtm->rtm_protocol == RTPROT_KERNEL)
		return 0;

	selfroute = is_selfroute(rtm->rtm_protocol);

	if (!startup && selfroute && h->nlmsg_type == RTM_NEWROUTE &&
	    !zrouter.asic_offloaded && !ctx) {
		if (IS_ZEBRA_DEBUG_KERNEL)
			zlog_debug("Route type: %d Received that we think we have originated, ignoring",
				   rtm->rtm_protocol);
		return 0;
	}

	/* We don't care about change notifications for the MPLS table. */
	/* TODO: Revisit this. */
	if (rtm->rtm_family == AF_MPLS)
		return 0;

	/* Table corresponding to route. */
	if (tb[RTA_TABLE])
		table = *(int *)RTA_DATA(tb[RTA_TABLE]);
	else
		table = rtm->rtm_table;

	/* Map to VRF */
	vrf_id = vrf_lookup_by_table(table, ns_id);
	if (vrf_id == VRF_DEFAULT) {
		if (!is_zebra_valid_kernel_table(table)
		    && !is_zebra_main_routing_table(table))
			return 0;
	}

	if (rtm->rtm_flags & RTM_F_TRAP)
		flags |= ZEBRA_FLAG_TRAPPED;
	if (rtm->rtm_flags & RTM_F_OFFLOAD)
		flags |= ZEBRA_FLAG_OFFLOADED;
	if (rtm->rtm_flags & RTM_F_OFFLOAD_FAILED)
		flags |= ZEBRA_FLAG_OFFLOAD_FAILED;

	if (h->nlmsg_flags & NLM_F_APPEND)
		flags |= ZEBRA_FLAG_OUTOFSYNC;

	/* Route which inserted by Zebra. */
	if (selfroute) {
		flags |= ZEBRA_FLAG_SELFROUTE;
		proto = proto2zebra(rtm->rtm_protocol, rtm->rtm_family, false);
	}
	if (tb[RTA_OIF])
		index = *(int *)RTA_DATA(tb[RTA_OIF]);

	if (tb[RTA_DST])
		dest = RTA_DATA(tb[RTA_DST]);
	else
		dest = anyaddr;

	if (tb[RTA_SRC])
		src = RTA_DATA(tb[RTA_SRC]);
	else
		src = anyaddr;

	if (tb[RTA_PREFSRC])
		prefsrc = RTA_DATA(tb[RTA_PREFSRC]);

	if (tb[RTA_GATEWAY])
		gate = RTA_DATA(tb[RTA_GATEWAY]);

	if (tb[RTA_NH_ID])
		nhe_id = *(uint32_t *)RTA_DATA(tb[RTA_NH_ID]);

	if (tb[RTA_PRIORITY])
		metric = *(int *)RTA_DATA(tb[RTA_PRIORITY]);

#if defined(SUPPORT_REALMS)
	if (tb[RTA_FLOW])
		tag = *(uint32_t *)RTA_DATA(tb[RTA_FLOW]);
#endif

	if (tb[RTA_METRICS]) {
		struct rtattr *mxrta[RTAX_MAX + 1];

		netlink_parse_rtattr(mxrta, RTAX_MAX, RTA_DATA(tb[RTA_METRICS]),
				     RTA_PAYLOAD(tb[RTA_METRICS]));

		if (mxrta[RTAX_MTU])
			mtu = *(uint32_t *)RTA_DATA(mxrta[RTAX_MTU]);
	}

	if (rtm->rtm_family == AF_INET) {
		p.family = AF_INET;
		if (rtm->rtm_dst_len > IPV4_MAX_BITLEN) {
			zlog_err(
				"Invalid destination prefix length: %u received from kernel route change",
				rtm->rtm_dst_len);
			return -1;
		}
		memcpy(&p.u.prefix4, dest, 4);
		p.prefixlen = rtm->rtm_dst_len;

		if (rtm->rtm_src_len != 0) {
			flog_warn(
				EC_ZEBRA_UNSUPPORTED_V4_SRCDEST,
				"unsupported IPv4 sourcedest route (dest %pFX vrf %u)",
				&p, vrf_id);
			return 0;
		}

		/* Force debug below to not display anything for source */
		src_p.prefixlen = 0;
	} else if (rtm->rtm_family == AF_INET6) {
		p.family = AF_INET6;
		if (rtm->rtm_dst_len > IPV6_MAX_BITLEN) {
			zlog_err(
				"Invalid destination prefix length: %u received from kernel route change",
				rtm->rtm_dst_len);
			return -1;
		}
		memcpy(&p.u.prefix6, dest, 16);
		p.prefixlen = rtm->rtm_dst_len;

		src_p.family = AF_INET6;
		if (rtm->rtm_src_len > IPV6_MAX_BITLEN) {
			zlog_err(
				"Invalid source prefix length: %u received from kernel route change",
				rtm->rtm_src_len);
			return -1;
		}
		memcpy(&src_p.prefix, src, 16);
		src_p.prefixlen = rtm->rtm_src_len;
	} else {
		/* We only handle the AFs we handle... */
		if (IS_ZEBRA_DEBUG_KERNEL)
			zlog_debug("%s: unknown address-family %u", __func__,
				   rtm->rtm_family);
		return 0;
	}

	/*
	 * For ZEBRA_ROUTE_KERNEL types:
	 *
	 * The metric/priority of the route received from the kernel
	 * is a 32 bit number.  We are going to interpret the high
	 * order byte as the Admin Distance and the low order 3 bytes
	 * as the metric.
	 *
	 * This will allow us to do two things:
	 * 1) Allow the creation of kernel routes that can be
	 *    overridden by zebra.
	 * 2) Allow the old behavior for 'most' kernel route types
	 *    if a user enters 'ip route ...' v4 routes get a metric
	 *    of 0 and v6 routes get a metric of 1024.  Both of these
	 *    values will end up with a admin distance of 0, which
	 *    will cause them to win for the purposes of zebra.
	 */
	if (proto == ZEBRA_ROUTE_KERNEL) {
		distance = (metric >> 24) & 0xFF;
		metric = (metric & 0x00FFFFFF);
	}

	if (IS_ZEBRA_DEBUG_KERNEL) {
		char buf2[PREFIX_STRLEN];

		zlog_debug(
			"%s %pFX%s%s vrf %s(%u) table_id: %u metric: %d Admin Distance: %d",
			nl_msg_type_to_str(h->nlmsg_type), &p,
			src_p.prefixlen ? " from " : "",
			src_p.prefixlen ? prefix2str(&src_p, buf2, sizeof(buf2))
					: "",
			vrf_id_to_name(vrf_id), vrf_id, table, metric,
			distance);
	}

	afi_t afi = AFI_IP;
	if (rtm->rtm_family == AF_INET6)
		afi = AFI_IP6;

	if (h->nlmsg_type == RTM_NEWROUTE) {
		struct route_entry *re;
		struct nexthop_group *ng = NULL;

		re = zebra_rib_route_entry_new(vrf_id, proto, 0, flags, nhe_id,
					       table, metric, mtu, distance,
					       tag);
		if (!nhe_id)
			ng = nexthop_group_new();

		if (!tb[RTA_MULTIPATH]) {
			struct nexthop *nexthop, nh;

			if (!nhe_id) {
				nh = parse_nexthop_unicast(
					ns_id, rtm, tb, bh_type, index, prefsrc,
					gate, afi, vrf_id);

				nexthop = nexthop_new();
				*nexthop = nh;
				nexthop_group_add_sorted(ng, nexthop);
			}
		} else {
			/* This is a multipath route */
			struct rtnexthop *rtnh =
				(struct rtnexthop *)RTA_DATA(tb[RTA_MULTIPATH]);

			if (!nhe_id) {
				uint8_t nhop_num;

				/* Use temporary list of nexthops; parse
				 * message payload's nexthops.
				 */
				nhop_num =
					parse_multipath_nexthops_unicast(
						ns_id, ng, rtm, rtnh, tb,
						prefsrc, vrf_id);

				zserv_nexthop_num_warn(
					__func__, (const struct prefix *)&p,
					nhop_num);

				if (nhop_num == 0) {
					nexthop_group_delete(&ng);
					ng = NULL;
				}
			}
		}
		if (nhe_id || ng) {
			dplane_rib_add_multipath(afi, SAFI_UNICAST, &p, &src_p,
						 re, ng, startup, ctx);
			if (ng)
				nexthop_group_delete(&ng);
		} else {
			/*
			 * I really don't see how this is possible
			 * but since we are testing for it let's
			 * let the end user know why the route
			 * that was just received was swallowed
			 * up and forgotten
			 */
			zlog_err(
				"%s: %pFX multipath RTM_NEWROUTE has a invalid nexthop group from the kernel",
				__func__, &p);
			XFREE(MTYPE_RE, re);
		}
	} else {
		if (ctx) {
			zlog_err(
				"%s: %pFX RTM_DELROUTE received but received a context as well",
				__func__, &p);
			return 0;
		}

		if (nhe_id) {
			rib_delete(afi, SAFI_UNICAST, vrf_id, proto, 0, flags,
				   &p, &src_p, NULL, nhe_id, table, metric,
				   distance, true);
		} else {
			if (!tb[RTA_MULTIPATH]) {
				struct nexthop nh;

				nh = parse_nexthop_unicast(
					ns_id, rtm, tb, bh_type, index, prefsrc,
					gate, afi, vrf_id);
				rib_delete(afi, SAFI_UNICAST, vrf_id, proto, 0,
					   flags, &p, &src_p, &nh, 0, table,
					   metric, distance, true);
			} else {
				/* XXX: need to compare the entire list of
				 * nexthops here for NLM_F_APPEND stupidity */
				rib_delete(afi, SAFI_UNICAST, vrf_id, proto, 0,
					   flags, &p, &src_p, NULL, 0, table,
					   metric, distance, true);
			}
		}
	}

	return 1;
}
```
