setup
--

created 2 projects and 2 users; project1, project2, and user1, user2
user1 has roles: Member, _member_, anotherrole, heat_stack_owner in project1
(these roles copied from the demo user in demo project of devstack)
user1 creates a container in project1 named user1_container

also sourced the admin creds to make the commands easier, made all passwords
the same which is why these commands work without explicitly setting password


1. get the ids needed

    $ keystone user-list
    +----------------------------------+-------------------+---------+---------------------+
    |                id                |        name       | enabled |        email        |
    +----------------------------------+-------------------+---------+---------------------+
    | a366106aea6344528852249076399365 |       user1       |   True  |                     |
    | 73ac0e77166043418102414fc23c34ee |       user2       |   True  |                     |

2. get the tenant id needed

    $ keystone tenant-list
    +----------------------------------+--------------------+---------+
    |                id                |        name        | enabled |
    +----------------------------------+--------------------+---------+
    | baf6f15467714034b4f97fdecc550506 |      project1      |   True  |

3. create a json file for the trust creation

    trust_creation.json
    {
      "trust": {
        "impersonation": false,
        "project_id": "baf6f15467714034b4f97fdecc550506",
        "roles": [
            {
                "name": "Member"
            }
        ],
          "trustee_user_id": "73ac0e77166043418102414fc23c34ee",
          "trustor_user_id": "a366106aea6344528852249076399365"
      }
    }

4. get a token for the trustor

    $ keystone --os-username=user1 --os-tenant-name=project1 token-get
    +-----------+----------------------------------+
    |  Property |              Value               |
    +-----------+----------------------------------+
    |  expires  |       2014-07-03T18:45:04Z       |
    |     id    | 316f9a2732c94a50bcd72c3442c1c298 |
    | tenant_id | baf6f15467714034b4f97fdecc550506 |
    |  user_id  | a366106aea6344528852249076399365 |
    +-----------+----------------------------------+

5. create trust

    $ http http://localhost:5000/v3/OS-TRUST/trusts X-Auth-Token:316f9a2732c94a50bcd72c3442c1c298 < trust_creation.json
    HTTP/1.1 201 Created
    Content-Length: 676
    Content-Type: application/json
    Date: Thu, 03 Jul 2014 17:47:28 GMT
    Vary: X-Auth-Token

    {
        "trust": {
            "expires_at": null, 
                "id": "0cd44208d1eb44e0af367c1c3ecc3ae4", 
                "impersonation": false, 
                "links": {
                    "self": "http://10.0.1.62:5000/v3/OS-TRUST/trusts/0cd44208d1eb44e0af367c1c3ecc3ae4"
                }, 
                "project_id": "baf6f15467714034b4f97fdecc550506", 
                "remaining_uses": null, 
                "roles": [
                {
                    "id": "aa7a57296f5d462da8580fd23d297356", 
                    "links": {
                        "self": "http://10.0.1.62:5000/v3/roles/aa7a57296f5d462da8580fd23d297356"
                    }, 
                    "name": "Member"
                }
            ], 
                "roles_links": {
                    "next": null, 
                    "previous": null, 
                    "self": "http://10.0.1.62:5000/v3/OS-TRUST/trusts/0cd44208d1eb44e0af367c1c3ecc3ae4/roles"
                }, 
                "trustee_user_id": "73ac0e77166043418102414fc23c34ee", 
                "trustor_user_id": "a366106aea6344528852249076399365"
        }
    }


6. get a token for trustee
*this token is purposely not scoped to a project*

    $ keystone --os-username=user2 --os-tenant-name= token-get
    +----------+----------------------------------+
    | Property |              Value               |
    +----------+----------------------------------+
    | expires  |       2014-07-03T18:49:52Z       |
    |    id    | 5a169bffe56b4af3af14e5f336a74d26 |
    | user_id  | 73ac0e77166043418102414fc23c34ee |
    +----------+----------------------------------+

7. create a json file for trust consumption

    trust_consumption.json
    {
      "auth": {
        "identity": {
          "methods": [
            "token"
            ],
          "token": {
            "id": "5a169bffe56b4af3af14e5f336a74d26"
          }
        },
        "scope": {
          "OS-TRUST:trust": {
            "id": "0cd44208d1eb44e0af367c1c3ecc3ae4"
          }
        }
      }
    }

8. consume trust

    $ http http://localhost:5000/v3/auth/tokens X-Auth-Token:5a169bffe56b4af3af14e5f336a74d26 < trust_consumption.json
    HTTP/1.1 201 Created
    Content-Length: 7406
    Content-Type: application/json
    Date: Thu, 03 Jul 2014 17:57:46 GMT
    Vary: X-Auth-Token
    X-Subject-Token: 1e81bd745cf947a4b0022a976b3bc77e

    {
        "token": {
            "OS-TRUST:trust": {
                "id": "0cd44208d1eb44e0af367c1c3ecc3ae4", 
                    "impersonation": false, 
                    "trustee_user": {
                        "id": "73ac0e77166043418102414fc23c34ee"
                    }, 
                    "trustor_user": {
                        "id": "a366106aea6344528852249076399365"
                    }
            }, 
            "catalog": [
               <CUTTING OUT CATALOG CONTENTS>
            ],
            "expires_at": "2014-07-03T18:49:52.000000Z", 
            "extras": {}, 
            "issued_at": "2014-07-03T17:57:46.108183Z", 
            "methods": [
                "token"
                ], 
            "project": {
                "domain": {
                    "id": "default", 
                    "name": "Default"
                }, 
                "id": "baf6f15467714034b4f97fdecc550506", 
                "name": "project1"
            }, 
            "roles": [
            {
                "id": "aa7a57296f5d462da8580fd23d297356", 
                "name": "Member"
            }
            ], 
            "user": {
                "domain": {
                    "id": "default", 
                    "name": "Default"
                }, 
                "id": "73ac0e77166043418102414fc23c34ee", 
                "name": "user2"
            }
        }
    }


fill ni trust token acquire json

    {
        "auth": {
            "identity": {
                "methods": [
                    "token"
                    ],
                "token": {
                    "id": "5a169bffe56b4af3af14e5f336a74d26"
                }
            },
            "scope": {
                "OS-TRUST:trust": {
                    "id": "0cd44208d1eb44e0af367c1c3ecc3ae4"
                }
            }
        }
    }

acquire a trust based token

    $ http $KEYSTONE_URL/v3/auth/tokens X-Auth-Token:TRUSTEE_TOKEN < trust_token_acquire.json
    HTTP/1.1 201 Created
    Content-Length: 7406
    Content-Type: application/json
    Date: Thu, 03 Jul 2014 18:16:34 GMT
    Vary: X-Auth-Token
    X-Subject-Token: 03d561ab59964899b7c2187d4ab7f199

    {
        "token": {
            "OS-TRUST:trust": {
                "id": "0cd44208d1eb44e0af367c1c3ecc3ae4", 
                    "impersonation": false, 
                    "trustee_user": {
                        "id": "73ac0e77166043418102414fc23c34ee"
                    }, 
                    "trustor_user": {
                        "id": "a366106aea6344528852249076399365"
                    }
            }, 
            "catalog": [
            ], 
            "expires_at": "2014-07-03T18:49:52.000000Z", 
            "extras": {}, 
            "issued_at": "2014-07-03T18:16:34.907387Z", 
            "methods": [
                "token"
                ], 
            "project": {
                "domain": {
                    "id": "default", 
                    "name": "Default"
                }, 
                "id": "baf6f15467714034b4f97fdecc550506", 
                "name": "project1"
            }, 
            "roles": [
            {
                "id": "aa7a57296f5d462da8580fd23d297356", 
                "name": "Member"
            }
            ], 
            "user": {
                "domain": {
                    "id": "default", 
                    "name": "Default"
                }, 
                "id": "73ac0e77166043418102414fc23c34ee", 
                "name": "user2"
            }
        }
    }

The X-Subject-Token header contains the newly created token.

test that it works

    $ http $SWIFT_URL X-Auth-Token:TRUSTEE_TRUST_TOKEN
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Content-Length: 16
    Content-Type: text/plain; charset=utf-8
    Date: Thu, 03 Jul 2014 18:19:32 GMT
    X-Account-Bytes-Used: 0
    X-Account-Container-Count: 1
    X-Account-Object-Count: 0
    X-Account-Storage-Policy-Policy-0-Bytes-Used: 0
    X-Account-Storage-Policy-Policy-0-Object-Count: 0
    X-Timestamp: 1404399806.82144
    X-Trans-Id: tx1a15b404d7804148aaecb-0053b59eb4

    user1_container

revoke trust

    $ http DELETE $KEYSTONE_URL/v3/OS-TRUST/trusts/TRUST_ID X-Auth-Token:TRUSTOR_TOKEN
    HTTP/1.1 204 No Content
    Content-Length: 0
    Date: Thu, 03 Jul 2014 19:25:42 GMT
    Vary: X-Auth-Token

