"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { viewAllReviews, createReview } from "../../server-actions";
import RemoveReview from "./RemoveReview";

const ReviewList = ({ username, slid }) => {
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState("");

  const fetchReviews = async () => {
    if (!username) return;
    try {
      const allReviews = await viewAllReviews(username, slid);
      setReviews(allReviews);

      setContent(allReviews.find((e) => e.reviewer === username)?.content || "")
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchReviews();
    }
  }, [username]);

  const handleContent = async () => {
    if (!username || !content.trim()) return;

    try {
      const newReview = await createReview(username, content, slid);

      setContent("");
      fetchReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <CardTitle className="text-3xl">Reviews</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Review Content</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Content</DialogTitle>
              <DialogDescription>Write Review</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Write your review..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-24 resize-none p-2"
              />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    type="button"
                    onClick={handleContent}
                    disabled={!content.trim()}
                  >
                    Submit Review
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {reviews.length > 0 ? (
          reviews.map((review, index) =>
            review.content.length > 0 ? (
              <Card key={index} className="p-2 flex flex-row justify-between">
                <CardContent>
                  {console.log(review)}
                  <p className="font-semibold">{review.reviewer}</p>
                  <p>{review.content}</p>
                </CardContent>
                <div className="flex flex-row gap-2">
                  {review.reviewer === username && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Edit Review</Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Review</DialogTitle>
                          <DialogDescription>Edit Review</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <Textarea
                            placeholder={review.content}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-24 resize-none p-2"
                          />

                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                type="button"
                                onClick={handleContent}
                                disabled={!content.trim()}
                              >
                                Submit Review
                              </Button>
                            </DialogClose>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <RemoveReview
                    username={username}
                    slid={slid}
                    reviewer={review.reviewer}
                    owner={review.owner}
                  />
                </div>
              </Card>
            ) : (
              <p key={index}></p>
            )
          )
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </Card>
  );
};

export default ReviewList;
