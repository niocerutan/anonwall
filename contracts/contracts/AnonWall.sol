// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract AnonWall {
    struct Post { address author; string content; uint256 upvotes; uint256 createdAt; }
    Post[] public posts;
    mapping(uint256 => mapping(address => bool)) public voted;
    event Posted(uint256 indexed id, address indexed author);
    event Upvoted(uint256 indexed id);
    function post(string calldata content) external returns (uint256 id) {
        id = posts.length;
        posts.push(Post(msg.sender, content, 0, block.timestamp));
        emit Posted(id, msg.sender);
    }
    function upvote(uint256 id) external {
        require(id < posts.length && !voted[id][msg.sender], "Invalid");
        voted[id][msg.sender] = true;
        posts[id].upvotes++;
        emit Upvoted(id);
    }
    function getPost(uint256 id) external view returns (address author, string memory content, uint256 upvotes, uint256 createdAt) {
        Post storage p = posts[id];
        return (p.author, p.content, p.upvotes, p.createdAt);
    }
    function totalPosts() external view returns (uint256) { return posts.length; }
}
