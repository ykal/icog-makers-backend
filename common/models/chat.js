'use strict';

module.exports = function (Chat) {
    Chat.getChatContent = async (user1, user2) => {
        console.log(typeof user1, user2)
        try {
            let chatContent = await Chat.find({
                where: {
                    and: [
                        {
                            or: [{ fromUser: user1 }, { fromUser: user2 }]
                        },
                        {
                            or: [{ toUser: user1 }, { toUser: user2 }]
                        }
                    ]
                }
            });
            return chatContent.reverse();
        } catch (error) {
            return error
        }
    }

    Chat.getChatFriends = async (userId) => {
        const { UserAccount } = Chat.app.models;
        let friends = [];
        let lastMessages = {}
        try {
            let chats = await Chat.find({ where: { or: [{ "fromUser": userId }, { "toUser": userId }] } });
            chats.forEach(chat => {
                if (chat.fromUser !== userId) {
                    if (friends.indexOf(chat.fromUser) !== -1) {
                    } else {
                        friends.push(chat.fromUser);
                    }
                    lastMessages[chat.fromUser] = chat.message
                } else if (chat.toUser !== userId) {
                    if (friends.indexOf(chat.toUser) !== -1) {
                    } else {
                        friends.push(chat.toUser);
                    }
                    lastMessages[chat.toUser] = { message: chat.message, createdAt: chat.createdAt }
                }
            });
            const friendsInfo = friends.map(async (friend) => {
                try {
                    let user = await UserAccount.findOne({ where: { id: friend } })
                    return user;
                } catch (error) {
                    return {}
                }
            });
            friends = await Promise.all(friendsInfo);
            return { friends, lastMessages };
        } catch (error) {
            return error;
        }
    }

    Chat.remoteMethod('getChatContent', {
        description: 'get chats between 2 users',
        http: {
            verb: "post",
            path: '/get-chat-content'
        },
        accepts: [
            {
                arg: 'user2',
                type: 'string',
                required: true
            },
            {
                arg: 'user1',
                type: 'string',
                required: true
            }
        ],
        returns: {
            arg: "chats",
            root: true
        }
    });

    Chat.remoteMethod('getChatFriends', {
        description: 'get chats friends of a user',
        http: {
            verb: "get",
            path: '/get-chat-friends/:userId'
        },
        accepts: [
            {
                arg: 'userId',
                type: 'string',
                required: true
            }
        ],
        returns: {
            arg: "Friends",
            root: true,
            type: 'object'
        }
    })
};
