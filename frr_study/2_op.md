```
2.md

:Author: kalipy
:Email: kalipy@debian
```

---zapi lib/zclient.c

### struct zapi_nexthop

### struct zapi_route

### zapi_neigh_ip

```
struct zapi_neigh_ip {
	int cmd;
	struct ipaddr ip_in;
	struct ipaddr ip_out;
	ifindex_t index;
	uint32_t ndm_state;
};
```

### zclient

```
/* Structure for the zebra client. */
struct zclient {
	/* The thread master we schedule ourselves on */
	struct thread_master *master;

	/* Privileges to change socket values */
	struct zebra_privs_t *privs;

	/* Do we care about failure events for route install? */
	bool receive_notify;

	/* Is this a synchronous client? */
	bool synchronous;

	/* BFD enabled with bfd_protocol_integration_init() */
	bool bfd_integration;

	/* Session id (optional) to support clients with multiple sessions */
	uint32_t session_id;

	/* Socket to zebra daemon. */
	int sock;

	/* Connection failure count. */
	int fail;

	/* Input buffer for zebra message. */
	struct stream *ibuf;

	/* Output buffer for zebra message. */
	struct stream *obuf;

	/* Buffer of data waiting to be written to zebra. */
	struct buffer *wb;

	/* Read and connect thread. */
	struct thread *t_read;
	struct thread *t_connect;

	/* Thread to write buffered data to zebra. */
	struct thread *t_write;

	/* Redistribute information. */
	uint8_t redist_default; /* clients protocol */
	unsigned short instance;
	struct redist_proto mi_redist[AFI_MAX][ZEBRA_ROUTE_MAX];
	vrf_bitmap_t redist[AFI_MAX][ZEBRA_ROUTE_MAX];

	/* Redistribute default. */
	vrf_bitmap_t default_information[AFI_MAX];

	/* Pointer to the callback functions. */
	void (*zebra_connected)(struct zclient *);
	void (*zebra_capabilities)(struct zclient_capabilities *cap);

	int (*handle_error)(enum zebra_error_types error);

	/*
	 * When the zclient attempts to write the stream data to
	 * it's named pipe to/from zebra, we may have a situation
	 * where the other daemon has not fully drained the data
	 * from the socket.  In this case provide a mechanism
	 * where we will *still* buffer the data to be sent
	 * and also provide a callback mechanism to the appropriate
	 * place where we can signal that we're ready to receive
	 * more data.
	 */
	void (*zebra_buffer_write_ready)(void);

	zclient_handler *const *handlers;
	size_t n_handlers;
};
```
