      import { useState, useEffect } from 'react';
      import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
      import { db } from '@/lib/firebase';
      import { useToast } from '@/hooks/use-toast';
      import { Button } from '@/components/ui/button';
      import {
       Table,
       TableBody,
       TableCell,
       TableHead,
       TableHeader,
       TableRow,
     } from '@/components/ui/table';
     import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
     import { Check, X, Loader2, Eye, Wallet } from 'lucide-react';
     import { getUserProfile } from '@/services/users';
     import { UserProfile } from '@/types'; // CORRIGIDO AQUI
     import { Transaction, approveWithdrawal, declineTransaction } from '@/services/transactions';
     import Link from 'next/link';
     import { format } from 'date-fns';
     import { QuerySnapshot } from 'firebase/firestore';
     
     type WithdrawalRequest = Transaction & {
         user?: UserProfile | null;
     }
     
     export default function AdminWithdrawalsPage() {