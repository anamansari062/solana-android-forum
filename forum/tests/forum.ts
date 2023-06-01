import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Forum } from "../target/types/forum";
import { PublicKey } from '@solana/web3.js';
import {encode} from "@project-serum/anchor/dist/cjs/utils/bytes/utf8";

const toBytesInt32 = (num: number): Buffer => {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, num);
    return Buffer.from(arr);
};

describe("forum", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Forum as Program<Forum>;

  let programInfoPda: PublicKey;
  let question1Pda: PublicKey;
  let question2Pda: PublicKey;
  let programInfo = null;
  let question1Info = null;
  let question2Info = null;

  it("Is program info initialized!", async () => {
    const [newProgramInfoPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
          [
              encode("program_info"),
          ],
          program.programId
      );
    
    programInfoPda = newProgramInfoPda

    // initializes the program info
    const transactionSignature = await program.methods
        .initializeProgramInfo()
        .accounts({
            author: provider.wallet.publicKey,
            programInfo: programInfoPda,
        })
        .rpc();

    programInfo = await program.account.programInfo.fetch(programInfoPda);

    console.log(programInfo)

  });

  it("it creates a question 1", async () => {

    const [newQuestionPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
          [
              encode("question"),
              toBytesInt32(programInfo.questionCount)
          ],
          program.programId
      );

    question1Pda = newQuestionPda;

    const transactionSignature = await program.methods
        .createQuestion("First Question")
        .accounts({
            question: question1Pda,
            author: provider.wallet.publicKey,
            programInfo: programInfoPda,
        })
        .rpc();

    question1Info = await program.account.question.fetch(question1Pda);

    console.log(question1Info)

  });

  it("it creates question 2", async () => {
    programInfo = await program.account.programInfo.fetch(programInfoPda);

    const [newQuestionPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
          [
              encode("question"),
              toBytesInt32(programInfo.questionCount)
          ],
          program.programId
      );

    question2Pda = newQuestionPda;

    const transactionSignature = await program.methods
        .createQuestion("First Question")
        .accounts({
            question: question2Pda,
            author: provider.wallet.publicKey,
            programInfo: programInfoPda,
        })
        .rpc();

    question2Info = await program.account.question.fetch(question2Pda);

    console.log(question2Info)
  
  });

  it("it creates a reply for question 1", async () => {

    const [newReplyPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
          [
              encode("reply"),
              toBytesInt32(question1Info.questionId),
              toBytesInt32(question1Info.replyCount)
          ],
          program.programId
      );

    const transactionSignature = await program.methods
        .createReply("First Reply for first question")
        .accounts({
            reply: newReplyPda,
            question: question1Pda,
            author: provider.wallet.publicKey,
        })
        .rpc();

    let replyInfo = await program.account.reply.fetch(newReplyPda);

    console.log(replyInfo)

  });

  it("it creates another reply for question 1", async () => {
    question1Info = await program.account.question.fetch(question1Pda);

    const [newReplyPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
          encode("reply"),
          toBytesInt32(question1Info.questionId),
          toBytesInt32(question1Info.replyCount)
      ],
      program.programId
    );

    const transactionSignature = await program.methods
        .createReply("Second Reply for first question")
        .accounts({
            reply: newReplyPda,
            question: question1Pda,
            author: provider.wallet.publicKey,
        })
        .rpc();

    let replyInfo = await program.account.reply.fetch(newReplyPda);

    console.log(replyInfo)

  
  });

  it("it creates reply for question 2", async () => {
    const [newReplyPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
          encode("reply"),
          toBytesInt32(question2Info.questionId),
          toBytesInt32(question2Info.replyCount)
      ],
      program.programId
    );

    const transactionSignature = await program.methods
        .createReply("First Reply for second question")
        .accounts({
            reply: newReplyPda,
            question: question2Pda,
            author: provider.wallet.publicKey,
        })
        .rpc();

    let replyInfo = await program.account.reply.fetch(newReplyPda);

    console.log(replyInfo)
  
  });


});
