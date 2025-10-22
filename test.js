import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.levelingupdata.com');

// you can also fetch all records at once via getFullList
const records = await pb.collection('invitations').getFullList({
    sort: '-created',
});

console.log(records);