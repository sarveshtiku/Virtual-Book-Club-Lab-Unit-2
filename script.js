let currentId = 3;  // ID counter for new reviews

// Load reviews from both JSON and localStorage
function loadReviews() {
    console.log("loadReviews called!");

    fetch("reviews.json")
        .then(response => response.json())
        .then(jsonReviews => {
            let storedReviews = getStoredReviews();
            const allReviews = [...jsonReviews, ...storedReviews];

            allReviews.forEach(review => {
                review.comments = getCommentsFromStorage(review.id);
                review.ratingCount = review.ratingCount || 1;
                const reviewElement = createReviewElement(review);
                document.getElementById("reviews-list").appendChild(reviewElement);
            });

            const maxId = allReviews.reduce((max, review) => Math.max(max, review.id), 0);
            currentId = maxId + 1;
        })
        .catch(error => console.error("Error loading reviews:", error));
}

// Get stored user-submitted reviews from localStorage
function getStoredReviews() {
    const stored = localStorage.getItem("userReviews");
    return stored ? JSON.parse(stored) : [];
}

// Save new review to localStorage
function saveReviewToStorage(review) {
    const stored = getStoredReviews();
    stored.push(review);
    localStorage.setItem("userReviews", JSON.stringify(stored));
}

// Get stored comments from localStorage
function getCommentsFromStorage(reviewId) {
    const comments = localStorage.getItem(`comments-${reviewId}`);
    return comments ? JSON.parse(comments) : [];
}

// Save comment to localStorage
function saveComment(reviewId, comment) {
    const comments = getCommentsFromStorage(reviewId);
    comments.push(comment);
    localStorage.setItem(`comments-${reviewId}`, JSON.stringify(comments));
}

// Delete comment from localStorage
function deleteComment(reviewId, commentIndex) {
    let comments = getCommentsFromStorage(reviewId);
    comments.splice(commentIndex, 1);
    localStorage.setItem(`comments-${reviewId}`, JSON.stringify(comments));
}

// Create review card
function createReviewElement(review) {
    const container = document.createElement("div");
    container.className = "review-item";

    const title = document.createElement("h3");
    title.textContent = review.title;
    container.appendChild(title);

    const text = document.createElement("p");
    text.textContent = review.reviewText;
    container.appendChild(text);

    const rating = document.createElement("p");
    rating.id = `rating-${review.id}`;
    rating.textContent = `Average Rating: ${review.rating.toFixed(1)} / 5`;
    container.appendChild(rating);

    const ratingForm = document.createElement("form");
    ratingForm.innerHTML = `
        <label for="new-rating-${review.id}">Add Rating:</label>
        <select id="new-rating-${review.id}">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>
        <button type="submit">Submit Rating</button>
    `;
    ratingForm.addEventListener("submit", (e) => handleNewRating(e, review));
    container.appendChild(ratingForm);

    const likeButton = document.createElement("button");
    likeButton.id = `like-${review.id}`;
    likeButton.dataset.liked = "false";
    likeButton.textContent = `Like (${review.likes})`;
    likeButton.addEventListener("click", () => toggleLike(likeButton));
    container.appendChild(likeButton);

    const repostButton = document.createElement("button");
    repostButton.id = `repost-${review.id}`;
    repostButton.textContent = `Repost (${review.reposts})`;
    repostButton.addEventListener("click", () => repostReview(repostButton));
    container.appendChild(repostButton);

    // Comments Section
    const commentSection = document.createElement("div");
    commentSection.id = `comments-${review.id}`;
    commentSection.className = "comments-section";

    const commentTitle = document.createElement("h4");
    commentTitle.textContent = "Comments:";
    commentSection.appendChild(commentTitle);

    review.comments.forEach((comment, index) => {
        const commentWrapper = document.createElement("div");
        commentWrapper.style.display = "flex";
        commentWrapper.style.alignItems = "center";
        commentWrapper.style.marginBottom = "5px";

        const p = document.createElement("p");
        p.textContent = comment;
        p.style.flex = "1";
        commentWrapper.appendChild(p);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.style.backgroundColor = "transparent";
        deleteBtn.style.border = "none";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.color = "red";
        deleteBtn.style.fontWeight = "bold";

        deleteBtn.addEventListener("click", () => {
            deleteComment(review.id, index);
            commentWrapper.remove();
        });

        commentWrapper.appendChild(deleteBtn);
        commentSection.appendChild(commentWrapper);
    });

    const commentForm = document.createElement("form");
    commentForm.innerHTML = `
        <input type="text" id="comment-input-${review.id}" placeholder="Leave a comment" required>
        <button type="submit">Post</button>
    `;
    commentForm.addEventListener("submit", (e) => handleCommentSubmit(e, review.id));
    commentSection.appendChild(commentForm);

    container.appendChild(commentSection);
    return container;
}

// Handle new review submission
function handleReviewSubmit(event) {
    event.preventDefault();

    const titleInput = document.getElementById("book-title").value;
    const reviewInput = document.getElementById("review-text").value;
    const ratingInput = parseInt(document.getElementById("rating").value);

    const newReview = {
        id: currentId++,
        title: titleInput,
        reviewText: reviewInput,
        rating: ratingInput,
        ratingCount: 1,
        likes: 0,
        reposts: 0,
        comments: []
    };

    saveReviewToStorage(newReview);
    const reviewElement = createReviewElement(newReview);
    document.getElementById("reviews-list").insertBefore(reviewElement, document.getElementById("reviews-list").firstChild);
    event.target.reset();
}

// Like logic
function toggleLike(button) {
    let liked = button.dataset.liked === "true";
    let count = parseInt(button.textContent.match(/\d+/)[0]);

    count += liked ? -1 : 1;
    button.dataset.liked = (!liked).toString();
    button.textContent = `Like (${count})`;
}

// Repost logic
function repostReview(button) {
    let count = parseInt(button.textContent.match(/\d+/)[0]);
    count += 1;
    button.textContent = `Repost (${count})`;
}

// Handle comment submission
function handleCommentSubmit(event, reviewId) {
    event.preventDefault();
    const input = document.getElementById(`comment-input-${reviewId}`);
    const commentText = input.value;

    const commentSection = document.getElementById(`comments-${reviewId}`);
    const index = getCommentsFromStorage(reviewId).length;

    const commentWrapper = document.createElement("div");
    commentWrapper.style.display = "flex";
    commentWrapper.style.alignItems = "center";
    commentWrapper.style.marginBottom = "5px";

    const p = document.createElement("p");
    p.textContent = commentText;
    p.style.flex = "1";
    commentWrapper.appendChild(p);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.backgroundColor = "transparent";
    deleteBtn.style.border = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "red";
    deleteBtn.style.fontWeight = "bold";

    deleteBtn.addEventListener("click", () => {
        deleteComment(reviewId, index);
        commentWrapper.remove();
    });

    commentWrapper.appendChild(deleteBtn);
    commentSection.insertBefore(commentWrapper, commentSection.querySelector("form"));

    saveComment(reviewId, commentText);
    input.value = "";
}

// Handle rating submission
function handleNewRating(event, review) {
    event.preventDefault();
    const newRating = parseInt(document.getElementById(`new-rating-${review.id}`).value);
    review.rating = ((review.rating * review.ratingCount) + newRating) / (review.ratingCount + 1);
    review.ratingCount += 1;

    document.getElementById(`rating-${review.id}`).textContent = `Average Rating: ${review.rating.toFixed(1)} / 5`;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadReviews();
    document.getElementById("review-form").addEventListener("submit", handleReviewSubmit);
});
