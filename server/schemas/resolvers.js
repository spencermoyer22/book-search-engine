const { Book, User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks')

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            console.log(user);
            if (context.user) {
                if (context.user) {
                    const newUserData = await user.findByIdAndUpdate(context.user._id, { $push: { savedBooks: bookData} }, { new: true });
                    return newUserData;
                }
                throw new AuthenticationError('Please log in!')
            }
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const newUserData = await user.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: args.bookId } }, { new: true });
                return (
                    newUserData
                )
            }
            throw new AuthenticationError('Please log in!')
        }
    }
};

module.exports = resolvers;